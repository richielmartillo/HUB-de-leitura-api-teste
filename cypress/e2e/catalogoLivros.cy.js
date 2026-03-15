/// <reference types="cypress" />

describe('Testes da Funcionalidade Catálogo de Livros', () => {
  let token

  beforeEach(() => {
    cy.fixture('livros').as('livros')
    cy.geraToken('admin@biblioteca.com', 'admin123').then((tkn) => {
      token = tkn
    })
  })

  describe('GET - Gestão de catálogo de livros', () => {
    it('Deve listar livros com sucesso', () => {
      cy.api({
        method: 'GET',
        url: 'books',
        headers: { Authorization: token }
      }).should((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.books).to.be.an('array')
      })
    })

    it('Deve validar propriedades de um livro', () => {
      cy.api({
        method: 'GET',
        url: 'books',
        headers: { Authorization: token }
      }).should((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.books).to.be.an('array')
        expect(response.body.books.length).to.be.greaterThan(0)

        expect(response.body.books[0]).to.have.property('id')
        expect(response.body.books[0]).to.have.property('title')
        expect(response.body.books[0]).to.have.property('author')
      })
    })

    it('Deve listar um livro com sucesso buscando por ID de forma dinâmica', () => {
      cy.api({
        method: 'GET',
        url: 'books',
        headers: { Authorization: token }
      }).then((listResponse) => {
        expect(listResponse.status).to.equal(200)
        expect(listResponse.body.books.length).to.be.greaterThan(0)

        const bookId = listResponse.body.books[0].id

        cy.api({
          method: 'GET',
          url: `books/${bookId}`,
          headers: { Authorization: token }
        }).should((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.book).to.have.property('id', bookId)
          expect(response.body.book).to.have.property('title')
          expect(response.body.book).to.have.property('author')
        })
      })
    })

    it('Deve listar autores com sucesso', () => {
      cy.api({
        method: 'GET',
        url: 'books/authors',
        headers: { Authorization: token }
      }).should((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('authors')
        expect(response.body.authors).to.be.an('array')
      })
    })

    it('Deve listar livros com sucesso usando filtros', () => {
      cy.api({
        method: 'GET',
        url: 'books',
        headers: { Authorization: token },
        qs: {
          search: 'Dom Casmurro',
          category: 'Literatura Brasileira',
          author: 'Machado de Assis'
        }
      }).should((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.books).to.be.an('array')
      })
    })

    it('Deve obter detalhes de um livro específico', () => {
      cy.api({
        method: 'GET',
        url: 'books',
        headers: { Authorization: token },
        qs: {
          limit: 1,
          offset: 0
        }
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.books.length).to.be.greaterThan(0)

        const bookId = response.body.books[0].id

        cy.api({
          method: 'GET',
          url: `books/${bookId}`,
          headers: { Authorization: token }
        }).then((detalheResponse) => {
          expect(detalheResponse.status).to.equal(200)
          expect(detalheResponse.body.book.id).to.equal(bookId)
          expect(detalheResponse.body.book.title).to.exist
          expect(detalheResponse.body.book.author).to.exist
        })
      })
    })
  })

  describe('POST - Gestão de livros', () => {
    it('Deve cadastrar um livro com sucesso', function () {
      const livro = {
        ...this.livros.livroValido,
        title: `Livro ${Date.now()}`,
        author: `Autor ${Date.now()}`,
        isbn: `978-85-${Date.now()}`
      }

      cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        body: livro
      }).should((response) => {
        expect(response.status).to.equal(201)
        expect(response.body.message).to.equal('Livro criado com sucesso.')
        expect(response.body.book).to.have.property('id')
        expect(response.body.book.title).to.equal(livro.title)
        expect(response.body.book.author).to.equal(livro.author)
      })
    })

    it('Deve validar a mensagem de erro do livro com dados inválidos', function () {
      cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        body: this.livros.livroInvalido,
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.equal(400)
        expect(response.body.message).to.equal('"title" is not allowed to be empty')
        expect(response.body.field).to.equal('title')
      })
    })
  })

  describe('PUT - Gestão de livros', () => {
    it('Deve atualizar com sucesso um livro criado dinamicamente', function () {
      const livroNovo = {
        ...this.livros.livroValido,
        title: `Livro ${Date.now()}`,
        author: `Autor ${Date.now()}`,
        isbn: `978-85-${Date.now()}`
      }

      const dadosAtualizados = {
        ...this.livros.livroValido,
        title: `Livro atualizado ${Date.now()}`,
        author: `Autor atualizado ${Date.now()}`,
        isbn: `978-85-${Date.now() + 1}`
      }

      cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        body: livroNovo
      }).then((createResponse) => {
        expect(createResponse.status).to.equal(201)

        const bookId = createResponse.body.book.id

        cy.api({
          method: 'PUT',
          url: `books/${bookId}`,
          headers: { Authorization: token },
          body: dadosAtualizados
        }).should((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.message).to.equal('Livro atualizado com sucesso.')
        })
      })
    })
  })

  describe('DELETE - Gestão de livros', () => {
    it('Deve excluir um livro com sucesso de forma dinâmica', function () {
      const livroNovo = {
        ...this.livros.livroValido,
        title: `Livro deletar ${Date.now()}`,
        author: `Autor deletar ${Date.now()}`,
        isbn: `978-85-${Date.now()}`
      }

      cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        body: livroNovo
      }).then((createResponse) => {
        expect(createResponse.status).to.equal(201)

        const bookId = createResponse.body.book.id

        cy.api({
          method: 'DELETE',
          url: `books/${bookId}`,
          headers: { Authorization: token }
        }).should((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.message).to.equal('Livro deletado com sucesso.')
        })
      })
    })
  })
})