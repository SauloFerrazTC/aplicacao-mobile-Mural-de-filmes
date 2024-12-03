export class Comentario {
    public id: number;
    public coment: string;
    public iduser: number;
    public username: string;
    public idfilme: number;
    public tituloFilme: string;
    public data_criacao: string;
  
    constructor() {
      this.id = 0;
      this.coment = '';
      this.iduser = 0;
      this.username = '';
      this.idfilme = 0;
      this.tituloFilme = '';
      this.data_criacao = '';
    }
  }
  