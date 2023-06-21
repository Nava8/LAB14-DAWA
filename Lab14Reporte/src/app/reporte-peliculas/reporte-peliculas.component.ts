import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as jsonexport from 'jsonexport/dist';
import { Alignment, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';

@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];
  generos: string[] = [];
  filtroGenero: string = '';
  filtroAnioLanzamiento: number | null = null;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
      this.peliculasFiltradas = data;
      this.generos = this.obtenerGeneros(data);
    });
  }

  obtenerGeneros(peliculas: any[]): string[] {
    const generosSet = new Set<string>();
    for (const pelicula of peliculas) {
      generosSet.add(pelicula.genero);
    }
    return Array.from(generosSet);
  }

  aplicarFiltros() {
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      let coincideGenero = true;
      let coincideAnioLanzamiento = true;

      if (this.filtroGenero !== '') {
        coincideGenero = pelicula.genero === this.filtroGenero;
      }

      if (this.filtroAnioLanzamiento !== null) {
        coincideAnioLanzamiento = pelicula.lanzamiento === this.filtroAnioLanzamiento;
      }

      return coincideGenero && coincideAnioLanzamiento;
    });
  }

  limpiarFiltros() {
    this.filtroGenero = '';
    this.filtroAnioLanzamiento = null;
    this.peliculasFiltradas = this.peliculas;
  }

  generarPDF() {
    this.aplicarFiltros();

    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Título', style: 'cabeceraTabla' },
              { text: 'Género', style: 'cabeceraTabla' },
              { text: 'Año de lanzamiento', style: 'cabeceraTabla' }
            ],
            ...this.peliculasFiltradas.map(pelicula => [
              { text: pelicula.titulo, style: 'textoTabla' },
              { text: pelicula.genero, style: 'textoTabla' },
              { text: pelicula.lanzamiento.toString(), style: 'textoTabla' }
            ])
          ]
        }
      }
    ];

    const estilos: StyleDictionary = {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center' as Alignment,
        margin: [0, 0, 0, 10]
      },
      cabeceraTabla: {
        fillColor: '#337ab7',
        color: '#ffffff',
        bold: true,
        fontSize: 12,
        alignment: 'center' as Alignment,
        margin: [0, 5, 0, 5]
      },
      textoTabla: {
        margin: [0, 5, 0, 5],
        fontSize: 10
      }
    };

    const documentDefinition: TDocumentDefinitions = {
      content: contenido,
      styles: estilos
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  generarExcel() {
    const data = this.peliculasFiltradas.map(pelicula => ({
      Título: pelicula.titulo,
      Género: pelicula.genero,
      'Año de lanzamiento': pelicula.lanzamiento
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { 'Informe': worksheet }, SheetNames: ['Informe'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelBlob, 'informe.xlsx');
  }
  

  generarCSV() {
    this.aplicarFiltros();

    const jsonData = this.peliculasFiltradas;
    jsonexport(jsonData, (err: any, csv: any) => {
      if (err) {
        console.error(err);
        return;
      }
      const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.guardarArchivo(csvData, 'informe.csv', 'text/csv;charset=utf-8;');
    });
  }

  guardarArchivo(data: any, filename: string, contentType: string) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(data);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
