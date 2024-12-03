import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, ToastController, IonicModule, LoadingController, AlertController} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CommonModule } from '@angular/common';
import { Usuario } from '../home/usuario.model';
import { Comentario } from './comentario.model';

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [HttpClient, Storage]
})
export class ComentarioPage implements OnInit {
  @Input() filmeId!: number; 
  comentarios: any[] = []; 
  usuarioToken: string | null = null;
  public usuario: Usuario = new Usuario();
  public lista_comentarios: Comentario[] = [];

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private toastController: ToastController,
    private storage: Storage,
    private controle_carregamento: LoadingController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    console.log('Filme ID recebido:', this.filmeId); 
    if (!this.filmeId) {
      const toast = await this.toastController.create({
        message: 'ID do filme não fornecido!',
        duration: 2000,
      });
      toast.present();
      this.fecharModal();
      return;
    }
    this.carregarComentarios();
  }
  

  async carregarComentarios() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');
    this.usuario = Object.assign(new Usuario(), registro);
    console.log('Usuário recuperado do Storage:', this.usuario);
    const token = this.usuario.token;
    if (!token) {
      const toast = await this.toastController.create({
        message: 'Você precisa estar logado para cadastrar um filme.',
        duration: 2000,
      });
      toast.present();
      return;
    }

    const httpHeaders = new HttpHeaders({
      'Authorization': `Token ${token}`,
    });

    this.http
      .get(`http://127.0.0.1:8000/comentarios/api/${this.filmeId}/`, { headers: httpHeaders })
      .subscribe({
        next: (data: any) => {
          this.comentarios = data; 
        },
        error: async () => {
          const toast = await this.toastController.create({
            message: 'Erro ao carregar comentários.',
            duration: 2000,
          });
          toast.present();
        },
      });
  }

  fecharModal() {
    this.modalController.dismiss();
  }

  async confirmarExclusao(comentarioId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Você tem certeza que deseja excluir este comentário?',
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
            this.excluircomentario(comentarioId);
          }
        }
      ]
    });

    await alert.present();
  }

  
  async excluircomentario(comentarioId: number) {
    const loading = await this.controle_carregamento.create({
      message: 'Excluindo filme...',
    });
    await loading.present();

    const token = this.usuario.token;
    const http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    });

    this.http.delete(`http://127.0.0.1:8000/comentarios/api/deletar/${comentarioId}/`, { headers: http_headers })
      .subscribe({
        next: async () => {
          loading.dismiss();
          const mensagem = await this.toastController.create({
            message: 'comentário excluído com sucesso.',
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
          this.carregarComentarios(); 
        },
        error: async (erro: any) => {
          loading.dismiss();
          const mensagem = await this.toastController.create({
            message: `Erro ao excluir comentário: ${erro.message}`,
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
        },
      });

    }


    async editarDescricao(comentario: Comentario) {
      const alert = await this.alertController.create({
        header: 'Editar Comentário',
        inputs: [
          {
            name: 'coment',
            type: 'textarea',
            value: comentario.coment, 
            placeholder: 'Edite o comentário',
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
              if (data.coment.trim() !== '') {
                await this.atualizarComentario(comentario.id, data.coment);
              } else {
                const toast = await this.toastController.create({
                  message: 'O comentário não pode ser vazio',
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
  
  
    async atualizarComentario(comentarioId: number, novaComent: string) {
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
  
      
      this.http.put(`http://127.0.0.1:8000/comentarios/api/edit/${comentarioId}/`, { coment: novaComent }, { headers: httpHeaders })
        .subscribe({
          next: async (resposta) => {
            loading.dismiss();
            console.log('Descrição atualizada com sucesso', resposta);
  
            
            const comentarioAtualizado = this.lista_comentarios.find(f => f.id === comentarioId);
            if (comentarioAtualizado) {
               comentarioAtualizado.coment = novaComent;
            }
  
            const toast = await this.toastController.create({
              message: 'Descrição atualizada com sucesso!',
              duration: 2000,
            });
            toast.present();
            this.carregarComentarios(); 
          },
          error: async (erro) => {
            loading.dismiss();
            console.error('Erro ao editar comentário:', erro);
            const toast = await this.toastController.create({
              message: 'Erro ao editar comentário.',
              duration: 2000,
            });
            toast.present();
          },
        });
        
      }

      async adicionarComentario() {
        const alert = await this.alertController.create({
          header: 'Adicionar Comentário',
          inputs: [
            {
              name: 'coment', 
              type: 'textarea',
              placeholder: 'Escreva seu comentário...',
            },
          ],
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Comentário não adicionado');
              },
            },
            {
              text: 'Confirmar',
              handler: async (data) => {
                if (data.coment.trim() !== '') {
                  await this.salvarComentario(data.coment); 
                } else {
                  const toast = await this.toastController.create({
                    message: 'O comentário não pode ser vazio',
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
      
      
      async salvarComentario(comentarioTexto: string) {
        const loading = await this.controle_carregamento.create({
          message: 'Adicionando comentário...',
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
      
       
        const comentarioData = {
          coment: comentarioTexto,
          iduser: this.usuario.id, 
          idfilme: this.filmeId, 
        };
      
        this.http.post(`http://127.0.0.1:8000/comentarios/api/addcoment/`, comentarioData, { headers: httpHeaders })
          .subscribe({
            next: async (resposta) => {
              loading.dismiss();
              console.log('Comentário adicionado com sucesso', resposta);
              
              this.carregarComentarios();
      
              const toast = await this.toastController.create({
                message: 'Comentário adicionado com sucesso!',
                duration: 2000,
              });
              toast.present();
            },
            error: async (erro) => {
              loading.dismiss();
              console.error('Erro ao adicionar comentário:', erro);
              const toast = await this.toastController.create({
                message: 'Erro ao adicionar comentário.',
                duration: 2000,
              });
              toast.present();
            },
          });
      }
      
}
