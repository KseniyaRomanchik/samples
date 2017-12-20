const Validators = {
  checkAuth: require('../validators/auth/check.auth.validator'),
  checkAdmin: require('../validators/auth/check.admin.validator'),
  id: require('../validators/admin/id.validator'),
  list: require('../validators/admin/list.validator'),
  achievement: require('../validators/admin/achievement.validator'),
  pagination: require('../validators/admin/pagination.validator'),
  block: require('../validators/admin/block.validator')
};

const AdminController = require('../controllers/admin.controller');

module.exports = router => {

  router.get(
    '/admin/users',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.paginateUsers.bind(AdminController)
  );

  router.get(
    '/admin/games',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.getAllGames.bind(AdminController)
  );

  router.get(
    '/admin/txs',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.paginateTxs.bind(AdminController)
  );

  router.get(
    '/admin/games/paginate',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.paginateGames.bind(AdminController)
  );

  router.get(
    '/admin/games/download',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.downloadAllGamesAsCsv.bind(AdminController)
  );

  router.get(
    '/admin/txs/download',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.downloadAllTxsAsCsv.bind(AdminController)
  );

  router.get(
    '/admin/users/download',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.downloadUsersAsCsv.bind(AdminController)
  );

  router.get(
    '/admin/achievements',
    Validators.checkAuth,
    Validators.checkAdmin,
    AdminController.getAchievementList.bind(AdminController)
  );

  router.get(
    '/admin/user/:id',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.getUserInfo.bind(AdminController)
  );

  router.get(
    '/admin/user/:id/txs',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.paginateTxs.bind(AdminController)
  );

  router.get(
    '/admin/user/:id/games',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.paginateGames.bind(AdminController)
  );

  router.get(
    '/admin/user/:id/games/download',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.downloadGamesAsCsv.bind(AdminController)
  );

  router.get(
    '/admin/user/:id/txs/download',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.pagination,
    AdminController.downloadTxsAsCsv.bind(AdminController)
  );

  router.post(
    '/admin/user/:id/block',
    Validators.checkAuth,
    Validators.checkAdmin,
    Validators.block,
    AdminController.blockUser.bind(AdminController)
  );
};
