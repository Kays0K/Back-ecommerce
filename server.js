import Fastify from 'fastify'
import { Pool } from 'pg'
import cors from '@fastify/cors'

const sql = new Pool({
    user: "postgres",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "e-commerce"
})

const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] 
})

servidor.get('/usuarios', async () => {
    const resultado = await sql.query('SELECT id, nome, email, tipo FROM USUARIO')
    return resultado.rows
})

servidor.get('/produtos', async () => {
    const resultado = await sql.query('SELECT * FROM PRODUTOS')
    return resultado.rows
})

servidor.post('/usuarios', async (request, reply) => {
    const { nome, senha, email, tipo } = request.body;

    if (!nome || !senha || !email || !tipo) {
        return reply.status(400).send(
            {error: "nome, senha, email e tipo são obrigatórios!"}
        )
    }

    await sql.query(
        'INSERT INTO USUARIO (nome, senha, email, tipo) VALUES ($1, $2, $3, $4)', 
        [nome, senha, email, tipo]
    )       
    reply.status(201).send({mensagem: "Usuário cadastrado com sucesso!"})
})

servidor.post('/produtos', async (request, reply) => {
    const { nome, urlImage } = request.body;

    if (!nome || !urlImage) {
        return reply.status(400).send({ error: "Nome e URL da imagem são obrigatórios!" })
    }

    await sql.query(
        'INSERT INTO PRODUTOS (nome, urlImage) VALUES ($1, $2)', 
        [nome, urlImage]
    )
    reply.status(201).send({ mensagem: "Produto criado com sucesso!" })
})

servidor.put('/usuarios/:id', async (request, reply) => {
    const body = request.body;
    const id = request.params.id;

    if (!body || !body.nome || !body.senha || !body.email || !body.tipo) {
        return reply.status(400).send({error: "nome, senha, email e tipo são obrigatórios!"})
    }

    const existe = await sql.query('SELECT * FROM USUARIO WHERE id = $1', [id])

    if (existe.rows.length === 0) {
        return reply.status(400).send({error: `Usuário com o id: ${id} não existe`})
    }
    
    await sql.query('UPDATE USUARIO SET nome = $1, senha = $2, email = $3, tipo = $4 WHERE id = $5', [body.nome, body.senha, body.email, body.tipo, id])
    reply.send({message: "Usuário alterado!"})
})

servidor.put('/produtos/:id', async (request, reply) => {
    const body = request.body;
    const id = request.params.id;

    if (!body || !body.nome || !body.urlImage) {
        return reply.status(400).send({ error: "nome, urlImage são obrigatórios!" })
    }

    const existe = await sql.query('SELECT * FROM PRODUTOS WHERE id = $1', [id])
    if (existe.rows.length === 0) {
        return reply.status(400).send({ error: `Produto com o id: ${id} não existe` })
    }

    await sql.query('UPDATE PRODUTOS SET nome = $1, urlImage = $2 WHERE id = $3', [body.nome, body.urlImage, id])     
    reply.send({ message: "Produto alterado!" })
})

servidor.delete('/usuarios/:id', async (request, reply) => {
    const id = request.params.id
    await sql.query('DELETE FROM USUARIO WHERE id = $1', [id])      
    reply.status(200).send({ message: "Usuário deletado com sucesso!" })
})

servidor.delete('/produtos/:id', async (request, reply) => {
    const id = request.params.id
    await sql.query('DELETE FROM PRODUTOS WHERE id = $1', [id])      
    reply.status(200).send({ message: "Produto removido!" })
})

servidor.post('/login', async (request, reply) => {
    const body = request.body;
    const resultado = await sql.query('SELECT id, nome, email, tipo FROM USUARIO WHERE email = $1 AND senha = $2', [body.email, body.senha])     

    if (resultado.rows.length === 0) {
        return reply.status(401).send({ error: "E-mail ou senha incorretos!" })
    }

    reply.status(200).send({
        mensagem: "Login realizado com sucesso!", 
        ok: true,
        usuario: resultado.rows[0]
    })
})

servidor.listen({
    port: 3000
})