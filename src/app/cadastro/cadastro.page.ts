import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, NavController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';  

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],  
  providers: [HttpClient]  
})
export class CadastroPage {
  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController,
    public controle_toast: ToastController,
    public http: HttpClient,  
  ) {}

  public usuario = {
    username: '',
    password1: '',
    password2: ''
  };

  isFormValid() {
    return this.usuario.password1 === this.usuario.password2 && this.usuario.username && this.usuario.password1;
  }  

  onSubmit() {
    if (this.isFormValid()) {
      this.cadastrarUsuario();
    } else {
      this.controle_toast.create({
        message: 'As senhas não coincidem ou os campos estão vazios!',
        duration: 2000
      }).then(toast => toast.present());
    }
  }  


  
  async cadastrarUsuario() {
    const loading = await this.controle_carregamento.create({ message: 'Cadastrando...', duration: 15000 });
    await loading.present();

    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    
    this.http.post(
      'http://127.0.0.1:8000/api/cadastro/',  
      this.usuario,
      { headers: http_headers }
    ).subscribe({
      next: async (resposta: any) => {
        loading.dismiss();
        this.controle_navegacao.navigateRoot('/home');  
      },
      error: async (erro: any) => {
        loading.dismiss();
        const mensagem = await this.controle_toast.create({
          message: `Falha ao cadastrar: ${erro.message}`,
          duration: 2000
        });
        mensagem.present();
      }
    });
  }

  Login() {
    this.controle_navegacao.navigateRoot('/home');
  }
}

