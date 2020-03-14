const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

describe('/api/genres', () => {
	let server;

	beforeEach(() => { server = require('../../index'); });

	afterEach(async () => {
		await Genre.remove({});
		await server.close();
	});

	describe('GET /', () => {
		it('should return all genres', async () => {
			await Genre.collection.insertMany([
				{ name: 'genre1' },
				{ name: 'genre2' },
			]);

			const res = await request(server).get('/api/genres');
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
			expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
			expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
		});
	});

	describe('GET /:id', () => {
		it('should return genre if valid ID is passed', async () => {
			const genre = new Genre({ name: 'genre1' });
			await genre.save();

			const res = await request(server).get(`/api/genres/${genre._id}`);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', genre.name);
		});

		it('should return 404 if invalid id is passed', async () => {
			const res = await request(server).get(`/api/genres/1`);
			expect(res.status).toBe(404);
		});

		it('should return 404 if no genre with given id exist', async () => {
			const id = mongoose.Types.ObjectId();
			const res = await request(server).get(`/api/genres/` + id);
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		let token;
		let name;

		const exec = async () => {
			return await request(server)
				.post('/api/genres')
				.set('x-auth-token', token)
				.send({ name });
		}

		beforeEach(() => {
			token = new User().generateAuthToken();
			name = 'genre1';
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
		});

		it('should return 400 if genre is less than 3 characters', async () => {
			name = 'aa';
			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should return 400 if genre is more than 50 characters', async () => {
			name = new Array(52).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should save genre if it is valid', async () => {
			await exec();
			const genre = await Genre.find({ name: 'genre1' });
			expect(genre).not.toBeNull();
		});

		it('should return genre if it is valid', async () => {
			const res = await exec();

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', 'genre1');
		});
	});

	describe('PUT /', () => {
		let token;
		let newName;
		let genre;
		let id;

		const exec = async () => {
			return await request(server)
				.put('/api/genres/' + id)
				.set('x-auth-token', token)
				.send({ name: newName });
		}

		beforeEach(async () => {
			genre = new Genre({ name: 'genre1' });
			await genre.save();

			token = new User().generateAuthToken();
			newName = 'genre2';
			id = genre._id;
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';

			const res = await exec();
			expect(res.status).toBe(401);
		});

		it('should return 400 if invalid ID is provided', async () => {
			id = 1;

			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should return 400 if new name is less than 3 characters', async () => {
			newName = '12';

			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should return 400 if new name is more than 50 characters', async () => {
			newName = new Array(52).join('a');

			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should return 404 if genre doesn\'t exist', async () => {
			id = mongoose.Types.ObjectId();

			const res = await exec();
			expect(res.status).toBe(404);
		});

		it('should update genre if passed id and new name are valid', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', 'genre2');
		});
	});

	describe('DELETE /:id', () => {
		let token;
		let genre;
		let id;

		const exec = async () => {
			return await request(server)
				.delete('/api/genres/' + id)
				.set('x-auth-token', token)
				.send();
		}

		beforeEach(async () => {
			genre = new Genre({ name: 'genre1' });
			await genre.save();

			token = new User({ isAdmin: true }).generateAuthToken();
			id = genre._id;
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';
			const res = await exec();
			expect(res.status).toBe(401);
		});

		it('should return 403 if user is not admin', async () => {
			token = new User().generateAuthToken();
			const res = await exec();
			expect(res.status).toBe(403);
		});

		it('should return 400 if ID is invalid', async () => {
			id = 1;

			const res = await exec();
			expect(res.status).toBe(400);
		});

		it('should return 404 if genre doesn\'t exist', async () => {
			id = mongoose.Types.ObjectId();

			const res = await exec();
			expect(res.status).toBe(404);
		});

		it('should delete the genre if input is valid', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			const genreInDb = await Genre.findById(id);
			expect(genreInDb).toBeNull();
		});

		it('should return the removed genre', async () => {
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('_id', id.toHexString());
			expect(res.body).toHaveProperty('name', genre.name);
		});
	});
});