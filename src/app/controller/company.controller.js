// src/app/controller/company.controller.js
const Company = require("../models/company.model");

const companyController = {
  // Get all companies
  async getAll(req, res) {
    try {
      const companies = await Company.getAll();
      res.json({ companies });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get company by ID
  async getById(req, res) {
    try {
      const company = await Company.getById(req.params.id);
      if (!company) return res.status(404).json({ message: "Company not found" });
      res.json({ company });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get company of current user
  async getMyCompany(req, res) {
    try {
      const company = await Company.getByUserId(req.user.id);
      if (!company) return res.status(404).json({ message: "Company not found" });
      res.json({ company });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create company
  async create(req, res) {
    try {
      const { name, description } = req.body;
      const newCompany = await Company.create({ name, description });
      res.status(201).json({ message: "Company created", company: newCompany });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update company
  async update(req, res) {
    try {
      const { name, description } = req.body;
      const updated = await Company.updateById(req.params.id, { name, description });
      if (!updated) return res.status(404).json({ message: "Company not found" });
      res.json({ message: "Company updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete company
  async delete(req, res) {
    try {
      const deleted = await Company.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Company not found" });
      res.json({ message: "Company deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get activities of company
  async getActivities(req, res) {
    try {
      const activities = await Company.getActivities(req.params.id);
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = companyController;