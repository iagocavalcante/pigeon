function CrudService (model) {
  this.model = model;
}

CrudService.prototype.list = async function () {
  let result = await this.model.find();
  return { data: result };
}

CrudService.prototype.insert = async function (data) {
  let result = await this.model.create(data);
  return { data: result };
}

CrudService.prototype.get = async function (id) {
  let result = await this.model.findById(id);
  return { data: result };
}

CrudService.prototype.update = async function (id, data) {
  let result = await this.model.findByIdAndUpdate(id, { $set: data}, { new: true });
  return { data: result };
}

CrudService.prototype.delete = async function (id) {
  let result = await this.model.findByIdAndDelete(id);
  return { data: result };
}

module.exports = CrudService;
