const { ChecklistItem, ChecklistProgress, User } = require('../models');
const { Op } = require('sequelize');

const getChecklist = async (req, res, next) => {
  try {
    const items = await ChecklistItem.findAll({ order: [['sort_order', 'ASC']] });
    const progress = await ChecklistProgress.findAll({
      where: { user_id: req.user.id },
    });
    const progressMap = {};
    progress.forEach((p) => {
      progressMap[p.checklist_item_id] = p;
    });
    const checklist = items.map((item) => {
      const prog = progressMap[item.id];
      return {
        id: item.id,
        code: item.code,
        title: item.title,
        description: item.description,
        is_mandatory: item.is_mandatory,
        sort_order: item.sort_order,
        completed: prog ? prog.completed : false,
        completed_at: prog ? prog.completed_at : null,
        notes: prog ? prog.notes : null,
      };
    });
    const totalItems = items.length;
    const completedItems = checklist.filter((c) => c.completed).length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    res.json({ checklist, progress_percent: progressPercent });
  } catch (err) {
    next(err);
  }
};

const updateChecklist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found.' });
    }
    const [progress, created] = await ChecklistProgress.findOrCreate({
      where: { user_id: req.user.id, checklist_item_id: id },
      defaults: { user_id: req.user.id, checklist_item_id: id, completed: true, completed_at: new Date() },
    });
    if (!created) {
      await progress.update({ completed: !progress.completed, completed_at: progress.completed ? null : new Date() });
    }
    const allItems = await ChecklistItem.findAll();
    const allProgress = await ChecklistProgress.findAll({
      where: { user_id: req.user.id, completed: true },
    });
    const completedIds = allProgress.map((p) => p.checklist_item_id);
    const allMandatoryDone = allItems
      .filter((i) => i.is_mandatory)
      .every((i) => completedIds.includes(i.id));
    if (allMandatoryDone) {
      const currentStatus = req.user.onboarding_status;
      if (currentStatus !== 'Checklist In Progress' && currentStatus !== 'Joining Confirmed') {
        await User.update(
          { onboarding_status: 'Checklist In Progress' },
          { where: { id: req.user.id } }
        );
      }
    }
    res.json({
      checklist_item_id: id,
      completed: progress.completed,
      completed_at: progress.completed_at,
      message: 'Checklist updated.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChecklist, updateChecklist };
