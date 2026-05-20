import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FinanceiroService, FinanceiroResumoResponse } from '../../services/financeiro';
import { EstoqueService, EstoqueResumoResponse } from '../../services/estoque';
import { ProductService } from '../../services/product';
import { UserService } from '../../services/user';
import { CategoriaService } from '../../services/categoria';
import { forkJoin } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTheme,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  colors: string[];
  theme: ApexTheme;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  colors: string[];
  theme: ApexTheme;
  legend: ApexLegend;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {
  private financeiroService = inject(FinanceiroService);
  private estoqueService = inject(EstoqueService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private categoriaService = inject(CategoriaService);
  private datePipe = inject(DatePipe);
  private cdr = inject(ChangeDetectorRef);

  // Dados dos Cards
  faturamentoMes: number = 0;
  ticketMedio: number = 0;
  vendasFinalizadas: number = 0;
  totalProdutos: number = 0;
  totalUsuarios: number = 0;
  totalCategorias: number = 0;

  // Listas
  estoqueBaixo: EstoqueResumoResponse[] = [];
  ultimasVendas: any[] = []; // Usaremos a lista do resumo financeiro

  // Estados de Loading
  loading: boolean = true;

  // Gráficos
  public seriesChartOptions!: Partial<ChartOptions>;
  public paymentChartOptions!: Partial<PieChartOptions>;
  hasChartData = false;
  hasPaymentData = false;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Formatar datas para yyyy-MM-dd
    const dataInicioStr = this.datePipe.transform(primeiroDia, 'yyyy-MM-dd') || '';
    const dataFimStr = this.datePipe.transform(hoje, 'yyyy-MM-dd') || '';

    forkJoin({
      financeiro: this.financeiroService.obterResumo(dataInicioStr, dataFimStr),
      estoque: this.estoqueService.consultarEstoqueBaixo(),
      produtos: this.productService.buscarTodos(),
      usuarios: this.userService.getAll(),
      categorias: this.categoriaService.getCategorias()
    }).subscribe({
      next: (result) => {
        // Financeiro
        this.faturamentoMes = result.financeiro.faturamentoBruto;
        this.ticketMedio = result.financeiro.ticketMedio;
        this.vendasFinalizadas = result.financeiro.vendasFinalizadas;
        this.ultimasVendas = result.financeiro.ultimasVendas;

        // Outros Totais
        this.totalProdutos = result.produtos.length;
        this.totalUsuarios = result.usuarios.length;
        this.totalCategorias = result.categorias.length;

        // Estoque
        this.estoqueBaixo = result.estoque;

        // Montar Gráficos
        this.montarGraficoSerie(result.financeiro.serieDiaria);
        this.montarGraficoPagamento(result.financeiro.formasPagamento);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private montarGraficoSerie(serieDiaria: any[]): void {
    if (!serieDiaria || serieDiaria.length === 0) {
      this.hasChartData = false;
      return;
    }

    const categories = serieDiaria.map(item => {
      // extrair dia/mes
      const date = new Date(item.data);
      return this.datePipe.transform(date, 'dd/MM') || '';
    });
    
    const dataVendas = serieDiaria.map(item => item.total);

    this.hasChartData = true;
    this.seriesChartOptions = {
      series: [
        {
          name: "Receita (R$)",
          data: dataVendas
        }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#4f46e5'],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 3
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#9ca3af'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => { return `R$ ${value.toFixed(2)}`; },
          style: {
            colors: '#9ca3af'
          }
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => {
            return `R$ ${val.toFixed(2)}`;
          }
        }
      }
    };
  }

  private montarGraficoPagamento(formasPagamento: any[]): void {
    if (!formasPagamento || formasPagamento.length === 0) {
      this.hasPaymentData = false;
      return;
    }

    const series = formasPagamento.map(f => f.total);
    const labels = formasPagamento.map(f => f.nome || `Forma ${f.formaPagamento}`);

    this.hasPaymentData = true;
    this.paymentChartOptions = {
      series: series,
      chart: {
        type: "donut",
        height: 350,
        fontFamily: 'Inter, sans-serif'
      },
      labels: labels,
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      theme: {
        mode: 'light'
      },
      legend: {
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
        labels: {
          colors: '#4b5563'
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  getStatusName(status: number): string {
    switch (status) {
      case 0: return 'Aberta';
      case 1: return 'Finalizada';
      case 2: return 'Cancelada';
      default: return 'Desconhecido';
    }
  }

  getPaymentName(fp: number): string {
    switch (fp) {
      case 0: return 'Dinheiro';
      case 1: return 'Cartão Crédito';
      case 2: return 'Cartão Débito';
      case 3: return 'Pix';
      default: return 'Outro';
    }
  }
}
