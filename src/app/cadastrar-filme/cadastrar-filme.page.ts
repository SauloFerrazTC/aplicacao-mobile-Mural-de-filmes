import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../home/usuario.model';
import { Storage } from '@ionic/storage-angular';
import { IonicModule, ToastController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastrar-filme',
  templateUrl: './cadastrar-filme.page.html',
  styleUrls: ['./cadastrar-filme.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
  providers: [HttpClient, Storage]
})
export class CadastrarFilmePage {
  filme: any = {
    titulo: '',
    ano: '',
    descricao: '',
    categoria: '',
    capa: null, 
  };

  public usuario: Usuario = new Usuario();

  
  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    public storage: Storage,
    private controle_toast: ToastController, 
    private navController: NavController,
    private router: Router
  ) {}

  // Método para capturar a imagem selecionada
  carregarCapa(event: any) {
    const file = event.target.files[0]; // Pega o arquivo de imagem
    if (file) {
      this.filme.capa = file; // Armazena o arquivo de imagem no objeto filme
    }
  }

  
  async confirmarCadastro() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');
    this.usuario = Object.assign(new Usuario(), registro);
    console.log('Usuário recuperado do Storage:', this.usuario);
    const token = this.usuario.token;
    if (!token) {
      const toast = await this.controle_toast.create({
        message: 'Você precisa estar logado para cadastrar um filme.',
        duration: 2000,
      });
      toast.present();
      return;
    }

    const httpHeaders = new HttpHeaders({
      'Authorization': `Token ${token}`,
    });

    const formData: FormData = new FormData();
    formData.append('titulo', this.filme.titulo);
    formData.append('ano', this.filme.ano);
    formData.append('descricao', this.filme.descricao);
    formData.append('categoria', this.filme.categoria);

    if (this.filme.capa) {
      formData.append('capa', this.filme.capa);  
    }

    
    this.http.post('http://127.0.0.1:8000/filmes/api/novofilme/', formData, { headers: httpHeaders })
      .subscribe({
        next: async () => {
          const toast = await this.controle_toast.create({
            message: 'Filme cadastrado com sucesso!',
            duration: 2000,
          });
          toast.present();
          this.fecharModal();
  
          window.location.reload();
       
        },
        error: async (erro) => {
          const toast = await this.controle_toast.create({
            message: 'Erro ao cadastrar filme.',
            duration: 2000,
          });
          toast.present();
          console.error('Erro ao cadastrar filme:', erro);
        },
      });
  }

 
  fecharModal() {
    this.modalController.dismiss();
  }
}
