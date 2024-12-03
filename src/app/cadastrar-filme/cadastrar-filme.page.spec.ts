import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarFilmePage } from './cadastrar-filme.page';


describe('CadastrarFilmePage', () => {
  let component: CadastrarFilmePage;
  let fixture: ComponentFixture<CadastrarFilmePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrarFilmePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
