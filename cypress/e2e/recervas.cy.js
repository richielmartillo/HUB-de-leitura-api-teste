/// <reference types="cypress"/>
let token
beforeEach(() => {
    cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
        token = tkn
    })
});
describe('Teste de API - Gestão de recervas', () => {
    it('Deve listar todas as reservas do usuário autenticado com estatísticas', () => {
        cy.request({
            method: 'GET',
            url: 'reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.reservations).to.be.an('array')
            expect(response.body.reservations.length).to.be.greaterThan(0)
        })
    });
    it('Deve validar as propriedades das reservas', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.reservations[0]).to.have.property('id')
            expect(response.body.reservations[0]).to.have.property('status')
            expect(response.body.reservations[0]).to.have.property('reservation_date')
        })
    });

    it('Deve retornar estatísticas detalhadas das reservas do usuário', () => {
        cy.api({
            method: 'GET',
            url: 'reservations/statistics',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('userId')
            expect(response.body).to.have.property('overall')

        })
    });


    it('Deve validar a mensagem de erro quando a reserva do livro já foi criada', () => {
        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            body: {
                bookId: 8
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).to.equal(400)
            expect(response.body).to.have.property('message')
            expect(response.body.message).to.equal('Você já possui uma reserva ativa para este livro.')
        })
    });

    it.only('Deve mostrar mensagem de erro quando atingir o limite de reservas disponíveis', () => {
        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            body: {
                bookId: 12
            },
          failOnStatusCode: false
        }).should(response => {
            expect(response.status).to.equal(400)
            expect(response.body).to.have.property('message')
            expect(response.body.message).to.equal('Você já possui uma reserva ativa para este livro.')
        })
    });

    it('PUT - cancelar reserva', () => {
        cy.api({
            method: 'PUT',
            url: 'reservations/5',
            headers: { 'Authorization': token },
            body: {
                action: "cancel"
            }
        }).should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.message).to.equal('Reserva cancelada com sucesso.')
        })
    });

});