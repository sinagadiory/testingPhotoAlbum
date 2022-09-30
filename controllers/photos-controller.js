const { Photo, User } = require('../models/index');

class PhotosController {
  static async findAll(req, res, next) {
    try {
      const { err = null } = req.body
      if (err === "Internal Server Error") throw { message: "Internal Server Error" }
      const photos = await Photo.findAll();
      res.status(200).json(photos);
    } catch (error) {
      next(error);
    }
  }

  static async findById(req, res, next) {
    const { id } = req.params;
    try {
      const photo = await Photo.findByPk(id, {
        attributes: { exclude: ['UserId'] },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email']
          }
        ]
      });
      if (!photo) throw { name: 'ErrNotFound' };
      res.status(200).json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    const { title, caption, image_url } = req.body;
    const UserId = req.user.id;
    try {
      const photo = await Photo.create({ title, caption, image_url, UserId });
      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      let { title, caption, image_url } = req.body
      const { id } = req.params
      const UserId = req.user.id
      const photo = await Photo.findByPk(id, { include: [{ model: User, attributes: ['id', 'username', 'email'] }] })
      if (!photo) throw { name: 'ErrNotFound' }
      if (photo.UserId !== UserId) throw { name: "Err Forbidden" }
      if (title === null) {
        title = photo.title
      }
      if (caption === null) {
        caption = photo.caption
      }
      if (image_url === null) {
        image_url = photo.image_url
      }
      const result = await Photo.update({ title, caption, image_url }, { where: { id }, returning: true })
      res.json(result[1])
    } catch (error) {
      next(error)
    }
  }

  static async deletePhoto(req, res, next) {
    try {
      const { id } = req.params
      const UserId = req.user.id
      const photo = await Photo.findByPk(id, { include: [{ model: User, attributes: ['id', 'username', 'email'] }] })
      if (!photo) throw { name: 'ErrNotFound' };
      if (photo.UserId !== UserId) throw { name: "Err Forbidden" }
      await Photo.destroy({ where: { id } })
      res.json({ message: "Berhasil Dihapus" })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = PhotosController;
