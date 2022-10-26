const { client } = require("./../config/mongoDB")

class MongoQuery {
    static async insert(_database, _collection, _query) {
        try {
            if (!Array.isArray(_query)) _query = new Array(_query)
            const database = client.db(_database);
            const collection = database.collection(_collection);
            const query = _query ? _query: {}
            const res = await collection.insertMany(query);
            return res
        } catch (e) {
            console.dir(e)
        } finally {
            // Ensures that the client will close when you finish/error
            //await client.close();
        }
    }

    static async find(_database, _collection, _query) {
        try {
            const database = client.db(_database);
            const collection = database.collection(_collection);
            const query = _query ? _query: {}
            const res = await collection.find(query).toArray();
            return res
        } catch (e) {
            console.dir(e)
        } finally {
            // Ensures that the client will close when you finish/error
            //await client.close();
        }
    }

    static async sort(_database, _collection, _query, _sort) {
        try {
            const database = client.db(_database);
            const collection = database.collection(_collection);
            const query = _query ? _query: {}
            const sort = _sort ? _sort : {}
            const res = await collection.find(query).sort(sort).toArray();
            return res
        } catch (e) {
            console.dir(e)
        } finally {
            // Ensures that the client will close when you finish/error
            //await client.close();
        }
    }

    static async delete(_database, _collection, _query, _force) {
        try {
            const database = client.db(_database);
            const collection = database.collection(_collection);
            const query = _query ? _query: {}
            if (query === {} && !_force) {
                new Error('Attention condition de supression vide !!')
            } else {
                const res = await collection.deleteMany(query);
                console.log(res);
                return res
            }          
            
        } catch (e) {
            console.dir(e)
        } finally {
            // Ensures that the client will close when you finish/error
            //await client.close();
        }
    }
}

module.exports = MongoQuery

