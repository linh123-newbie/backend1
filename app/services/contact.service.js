// const { ObjectId } = require("mongodb");

const { ObjectId } = require("mongodb");

class ContactService {
  constructor(client) {
    this.Contact = client.db("contactbook").collection("contacts");
    console.log("Using collection:", this.Contact.namespace);
  }

  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };

    // Remove undefined fields
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );

    return contact;
  }

  async create(payload) {
    const contact = this.extractContactData(payload);
    const result = await this.Contact.findOneAndUpdate(
      contact,
      { $set: { favorite: contact.favorite === true } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
  }

  // Tìm kiếm theo tên
  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.Contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
  const filter = { _id: new ObjectId(String(id).trim()) };  
  const update = this.extractContactData(payload);

  const check = await this.Contact.findOne(filter);
  console.log("findOne before update:", check);  

  const r = await this.Contact.updateOne(filter, { $set: update });
  console.log("matched:", r.matchedCount, "modified:", r.modifiedCount);

  if (r.matchedCount === 0) return null; 

  // trả về doc đã cập nhật
  return await this.Contact.findOne(filter);
}

async delete(id) {
  const filter = { _id: new ObjectId(String(id).trim()) };

  const doc = await this.Contact.findOne(filter);
  console.log("findOne before delete:", doc);

  if (!doc) return null; 

  const result = await this.Contact.deleteOne(filter);
  console.log("deleteOne result:", result);

  if (result.deletedCount > 0) {
    return doc; 
  }

  return null;
}

async findFavorite() {
    try {
      const result = await this.Contact.find({ favorite: true }).toArray();
      console.log("Favorite contacts:", result);
      return result;
    } catch (error) {
      console.error("Error in findFavorite:", error);
      throw error;
    }
  }

  async deleteAll() {
  try {
    const result = await this.Contact.deleteMany({});
    console.log("DeleteAll result:", result);
    return result.deletedCount; // số lượng document đã bị xóa
  } catch (error) {
    console.error("Error in deleteAll:", error);
    throw error; // để controller bắt lỗi
  }
}


}

module.exports = ContactService;
