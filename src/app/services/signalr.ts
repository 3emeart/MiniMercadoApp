import { Injectable, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

export interface AlertaEstoqueBaixo {
  id: string;
  produtoId: number;
  nomeProduto: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  mensagem: string;
  lida: boolean;
  criadoEm: string; // ISO String
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private readonly hubUrl = environment.hubUrl || 'http://localhost:5290/hubs/notifications';
  
  // State Signals
  public notifications = signal<AlertaEstoqueBaixo[]>([]);
  public activeToasts = signal<AlertaEstoqueBaixo[]>([]);
  public connectionState = signal<string>('Disconnected');

  // Computed Signals
  public unreadCount = computed(() => this.notifications().filter(n => !n.lida).length);

  constructor() {
    this.carregarNotificacoesDoStorage();
  }

  /**
   * Inicializa a conexão com o Hub do SignalR
   */
  public iniciarConexao(): void {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      console.log('SignalR: Conexão já iniciada ou em andamento.');
      return;
    }

    console.log(`SignalR: Tentando conectar ao Hub em: ${this.hubUrl}`);
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.registrarHandlers();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR: Conectado com sucesso!');
        this.connectionState.set('Connected');
      })
      .catch(err => {
        console.error('SignalR: Erro ao conectar ao Hub, tentando reconexão...', err);
        this.connectionState.set('Error');
      });

    this.hubConnection.onclose(() => {
      console.warn('SignalR: Conexão fechada.');
      this.connectionState.set('Disconnected');
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR: Reconectando devido ao erro:', error);
      this.connectionState.set('Reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR: Conexão reconectada com sucesso.');
      this.connectionState.set('Connected');
    });
  }

  /**
   * Encerra a conexão com o SignalR
   */
  public pararConexao(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR: Conexão encerrada intencionalmente.');
          this.connectionState.set('Disconnected');
        })
        .catch(err => console.error('SignalR: Erro ao fechar conexão', err));
    }
  }

  /**
   * Registra os eventos recebidos do servidor
   */
  private registrarHandlers(): void {
    this.hubConnection.on('ReceberAlertaEstoqueBaixo', (data: any) => {
      console.log('SignalR: Alerta recebido do backend:', data);
      
      const produtoId = data.produtoId ?? data.ProdutoId;
      const nomeProduto = data.nomeProduto ?? data.NomeProduto;
      const quantidadeAtual = data.quantidadeAtual ?? data.QuantidadeAtual;
      const estoqueMinimo = data.estoqueMinimo ?? data.EstoqueMinimo;
      const mensagemRaw = data.mensagem ?? data.Mensagem;

      // Monta um alerta local
      const novoAlerta: AlertaEstoqueBaixo = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString().slice(-4),
        produtoId,
        nomeProduto,
        quantidadeAtual,
        estoqueMinimo,
        mensagem: mensagemRaw || `🚨 O produto '${nomeProduto}' atingiu o estoque mínimo (${quantidadeAtual} restantes).`,
        lida: false,
        criadoEm: new Date().toISOString()
      };

      // Atualiza a lista de notificações no Signal
      this.notifications.update(prev => [novoAlerta, ...prev]);
      this.salvarNotificacoesNoStorage();

      // Exibe Toast temporário na tela
      this.exibirToast(novoAlerta);
    });
  }

  /**
   * Exibe um Toast animado temporariamente
   */
  private exibirToast(alerta: AlertaEstoqueBaixo): void {
    this.activeToasts.update(prev => [...prev, alerta]);

    // Remove o Toast após 6 segundos (tempo ideal de leitura)
    setTimeout(() => {
      this.activeToasts.update(prev => prev.filter(t => t.id !== alerta.id));
    }, 6000);
  }

  /**
   * Remove ativamente um Toast da tela se fechado manualmente
   */
  public removerToast(id: string): void {
    this.activeToasts.update(prev => prev.filter(t => t.id !== id));
  }

  /**
   * Marca uma notificação individual como lida
   */
  public marcarComoLida(id: string): void {
    this.notifications.update(prev =>
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
    this.salvarNotificacoesNoStorage();
  }

  /**
   * Marca todas as notificações como lidas
   */
  public marcarTodasComoLidas(): void {
    this.notifications.update(prev =>
      prev.map(n => ({ ...n, lida: true }))
    );
    this.salvarNotificacoesNoStorage();
  }

  /**
   * Exclui uma notificação da lista
   */
  public excluirNotificacao(id: string): void {
    this.notifications.update(prev => prev.filter(n => n.id !== id));
    this.salvarNotificacoesNoStorage();
  }

  /**
   * Limpa todo o histórico de notificações
   */
  public limparTudo(): void {
    this.notifications.set([]);
    this.salvarNotificacoesNoStorage();
  }

  // --- LOCAL STORAGE HELPERS ---
  
  private carregarNotificacoesDoStorage(): void {
    try {
      const stored = localStorage.getItem('notifications_alerts');
      if (stored) {
        this.notifications.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erro ao ler notificações do localStorage:', e);
    }
  }

  private salvarNotificacoesNoStorage(): void {
    try {
      localStorage.setItem('notifications_alerts', JSON.stringify(this.notifications()));
    } catch (e) {
      console.error('Erro ao salvar notificações no localStorage:', e);
    }
  }
}
