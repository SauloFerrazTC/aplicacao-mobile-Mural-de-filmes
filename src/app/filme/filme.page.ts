import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filme } from './filme.model';
import { Usuario } from '../home/usuario.model';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { IonicModule, LoadingController, NavController, ToastController, AlertController, ModalController} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { CadastrarFilmePage } from '../cadastrar-filme/cadastrar-filme.page';
import { ComentarioPage } from '../comentario/comentario.page';

@Component({
  selector: 'app-filme',
  templateUrl: './filme.page.html',
  styleUrls: ['./filme.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
  providers: [HttpClient, Storage]
})
export class FilmePage implements OnInit {

  public usuario: Usuario = new Usuario();
  public lista_filmes: Filme[] = [];
  public listaFiltrada: Filme[] = []; 
  public categoriaSelecionada: string = ''; 

  constructor(
    private modalController: ModalController,
    public http: HttpClient,
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');
  
    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      console.log('Usuário recuperado do Storage:', this.usuario);
  
      if (!this.usuario.token) {
        console.error('Token não encontrado no usuário.');
        return;
      }
  
      this.consultarFilmesSistemaWeb();
    } else {
      console.warn('Nenhum usuário encontrado no Storage.');
      this.controle_navegacao.navigateRoot('/home');
    }
  }
  


  async consultarFilmesSistemaWeb() {
    
    const loading = await this.controle_carregamento.create({
      message: 'Pesquisando...',
      duration: 60000,
    });
    await loading.present();
  
    
    const token = this.usuario.token;
    if (!token) {
      loading.dismiss();
      const mensagem = await this.controle_toast.create({
        message: 'Token de autenticação ausente. Por favor, faça login novamente.',
        cssClass: 'ion-text-center',
        duration: 2000,
      });
      mensagem.present();
      this.controle_navegacao.navigateRoot('/home');
      return;
    }
  
    
    const http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    });
  
    
    this.http.get('http://127.0.0.1:8000/filmes/api/', { headers: http_headers })
      .subscribe({
        next: async (resposta: any) => {
          console.log('Filmes recebidos:', resposta);
          this.lista_filmes = resposta;
          this.listaFiltrada = resposta; 
  
          
          loading.dismiss();
        },
        error: async (erro: any) => {
          console.error('Erro ao consultar filmes:', erro);
          loading.dismiss();
          const mensagem = await this.controle_toast.create({
            message: `Falha ao consultar filmes: ${erro.message}`,
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
        },
      });
  }

  
  getCategoria(categoria: string): string {
    switch (categoria) {
      case 'acao':
        return 'Ação';
      case 'drama':
        return 'Drama';
      case 'comedia':
        return 'Comédia';
      case 'suspense':
        return 'Suspense';
      case 'terror':
        return 'Terror';
      case 'ficcao':
        return 'Ficção Científica';    
      case 'romance':
        return 'Romance';          
      default:
        return categoria.charAt(0).toUpperCase() + categoria.slice(1);  
    }
  }

  
  filtrarFilmesPorCategoria() {
    if (this.categoriaSelecionada) {
      
      this.lista_filmes = this.lista_filmes.filter(filme => filme.categoria === this.categoriaSelecionada);
    } else {

      this.consultarFilmesSistemaWeb();  
    }
  }

  async confirmarExclusao(filmeId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Você tem certeza que deseja excluir este filme?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exclusão cancelada');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.excluirFilme(filmeId);
          }
        }
      ]
    });

    await alert.present();
  }

  
  async excluirFilme(filmeId: number) {
    const loading = await this.controle_carregamento.create({
      message: 'Excluindo filme...',
    });
    await loading.present();

    const token = this.usuario.token;
    const http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    });

    this.http.delete(`http://127.0.0.1:8000/filmes/api/${filmeId}/`, { headers: http_headers })
      .subscribe({
        next: async () => {
          loading.dismiss();
          const mensagem = await this.controle_toast.create({
            message: 'Filme excluído com sucesso.',
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
          this.consultarFilmesSistemaWeb(); 
        },
        error: async (erro: any) => {
          loading.dismiss();
          const mensagem = await this.controle_toast.create({
            message: `Erro ao excluir filme: ${erro.message}`,
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
        },
      });

    }

    async editarDescricao(filme: Filme) {
      const alert = await this.alertController.create({
        header: 'Editar Descrição',
        inputs: [
          {
            name: 'descricao',
            type: 'textarea',
            value: filme.descricao, 
            placeholder: 'Digite a nova descrição do filme',
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Edição cancelada');
            },
          },
          {
            text: 'Confirmar',
            handler: async (data) => {
              if (data.descricao.trim() !== '') {
                await this.atualizarDescricao(filme.id, data.descricao);
              } else {
                const toast = await this.controle_toast.create({
                  message: 'A descrição não pode ser vazia.',
                  duration: 2000,
                });
                toast.present();
              }
            },
          },
        ],
      });
  
      await alert.present();
    }
  
    
    async atualizarDescricao(filmeId: number, novaDescricao: string) {
      const loading = await this.controle_carregamento.create({
        message: 'Atualizando descrição...',
      });
      await loading.present();
  
      const token = this.usuario.token;
      if (!token) {
        console.error('Token ausente');
        loading.dismiss();
        return;
      }
  
      const httpHeaders: HttpHeaders = new HttpHeaders({
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      });
  
      
      this.http.put(`http://127.0.0.1:8000/filmes/api/edit/${filmeId}/`, { descricao: novaDescricao }, { headers: httpHeaders })
        .subscribe({
          next: async (resposta) => {
            loading.dismiss();
            console.log('Descrição atualizada com sucesso', resposta);
  
            
            const filmeAtualizado = this.lista_filmes.find(f => f.id === filmeId);
            if (filmeAtualizado) {
              filmeAtualizado.descricao = novaDescricao;
            }
  
            const toast = await this.controle_toast.create({
              message: 'Descrição atualizada com sucesso!',
              duration: 2000,
            });
            toast.present();
            this.consultarFilmesSistemaWeb();
          },
          error: async (erro) => {
            loading.dismiss();
            console.error('Erro ao atualizar descrição:', erro);
            const toast = await this.controle_toast.create({
              message: 'Erro ao atualizar descrição.',
              duration: 2000,
            });
            toast.present();
          },
        });
        
      }

      async abrirCadastroFilme() {
        const modal = await this.modalController.create({
          component: CadastrarFilmePage,  
        });
      
        await modal.present();
      }
 
      async comentarios(filme: Filme) {
        const modal = await this.modalController.create({
          component: ComentarioPage,
          componentProps: {
            filmeId: filme.id, 
          },
        });
        await modal.present();
      }
      
      async logout() {
        const alert = await this.alertController.create({
          header: 'Sair',
          message: 'Você tem certeza que deseja sair?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Logout cancelado');
              }
            },
            {
              text: 'Confirmar',
              handler: async () => {
                await this.storage.remove('usuario'); 
                this.controle_navegacao.navigateRoot('/home'); 
                const toast = await this.controle_toast.create({
                  message: 'Você foi desconectado com sucesso.',
                  duration: 2000,
                  cssClass: 'ion-text-center'
                });
                toast.present();
              }
            }
          ]
        });
      
        await alert.present();
      }
       
      
      
      
    }      
  
