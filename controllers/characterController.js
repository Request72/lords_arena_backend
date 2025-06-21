const Character = require('../models/character');

exports.getAllCharacters = async(req, res) => {
    const characters = await Character.find();
    res.json(characters);
};

exports.getCharacter = async(req, res) => {
    const character = await Character.findById(req.params.id);
    res.json(character);
};

exports.createCharacter = async(req, res) => {
    const character = new Character(req.body);
    await character.save();
    res.json(character);
};

exports.updateCharacter = async(req, res) => {
    const updated = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

exports.deleteCharacter = async(req, res) => {
    await Character.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
};