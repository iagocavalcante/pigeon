function CrudService (model) {
  this.model = model;
}

CrudService.prototype.list = async function (owner) {
  let result = await this.model.find({ owner });
  return { data: result };
}

CrudService.prototype.insert = async function (data, owner) {
  let result = await this.model.create({ ...data, owner });
  return { data: result };
}

CrudService.prototype.get = async function (id, owner) {
  let result = await this.model.findOne({ _id: id, owner });
  return { data: result };
}

CrudService.prototype.update = async function (id, owner, data) {
  let result = await this.model.findOneAndUpdate({ _id: id, owner }, { $set: data }, { returnDocument: 'after' });
  return { data: result };
}

CrudService.prototype.delete = async function (id, owner) {
  let result = await this.model.findOneAndDelete({ _id: id, owner });
  return { data: result };
}

module.exports = CrudService;
