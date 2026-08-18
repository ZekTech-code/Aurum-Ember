import { MongoClient, ObjectId } from 'mongodb';

let client = null;
let mongoDb = null;

export async function connectToMongo() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurum-ember';
  const DB_NAME = process.env.MONGODB_DB_NAME || 'aurum-ember';
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  mongoDb = client.db(DB_NAME);
  console.log(`  MongoDB connected: ${DB_NAME}`);
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    mongoDb = null;
  }
}

function collection(name) {
  if (!mongoDb) throw new Error('MongoDB not connected');
  return mongoDb.collection(name);
}

function toDoc(item) {
  if (!item) return item;
  const { _id, ...rest } = item;
  if (_id !== undefined) rest._id = String(_id);
  return rest;
}

function toInsertDoc(item) {
  const { _id, ...rest } = item;
  return rest;
}

export const db = {
  async get(name) {
    const docs = await collection(name).find({}).toArray();
    return docs.map(toDoc);
  },

  async set(name, data) {
    await collection(name).deleteMany({});
    if (data.length > 0) {
      await collection(name).insertMany(data.map(toInsertDoc));
    }
  },

  async insert(name, item) {
    item.createdAt = item.createdAt || new Date().toISOString();
    const doc = toInsertDoc(item);
    const result = await collection(name).insertOne(doc);
    item._id = String(result.insertedId);
    return item;
  },

  async findById(name, id) {
    let doc;
    try {
      doc = await collection(name).findOne({ _id: new ObjectId(id) });
    } catch {
      doc = await collection(name).findOne({ _id: id });
    }
    return doc ? toDoc(doc) : null;
  },

  async updateById(name, id, updates) {
    const { _id, createdAt, ...updateFields } = updates;
    updateFields.updatedAt = new Date().toISOString();

    let result;
    try {
      result = await collection(name).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
    } catch {
      result = await collection(name).findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
    }
    return result ? toDoc(result) : null;
  },

  async deleteById(name, id) {
    let result;
    try {
      result = await collection(name).deleteOne({ _id: new ObjectId(id) });
    } catch {
      result = await collection(name).deleteOne({ _id: id });
    }
    return result.deletedCount > 0;
  },

  async query(name, predicate) {
    const docs = await collection(name).find({}).toArray();
    return docs.map(toDoc).filter(predicate);
  },
};
