export class Filme {
    public id: number;
    public iduser: number;
    public categoria: string; 
    public titulo: string;
    public descricao: string;
    public ano: number;
    public capa: string | undefined;
  
    constructor() {
      this.id = 0;
      this.iduser = 0;
      this.categoria = ''; 
      this.descricao = '';
      this.titulo = '';
      this.ano = 0;
    }
  }
  