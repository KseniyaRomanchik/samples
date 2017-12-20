const async = require('async');
const csv = require('csv-express');
const moment = require('moment');
const logger = require('log4js').getLogger('controllers/admin.controller');

const Services = {
  raven: require('../services/raven'),
  EthService: require('../services/ethereum.service'),
  currency: require('../services/currency.service'),
  socket: require('../services/socket.service')
}

const Repositories = {
  user: require('../repositories/user.repository'),
  table: require('../repositories/table.repository'),
  history: require('../repositories/balance.history.repository'),
  game: require('../repositories/game.repository'),
  achievement: require('../repositories/achievement.repository'),
  session: require('../repositories/session.repository')
};

class AdminController {

  paginateUsers(req, res) {

    async.waterfall([
      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.user.paginateUsers(req.form, cb);
      },

    ], (err, users) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).json(users);
    });
  }

  downloadUsersAsCsv(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.user.paginateUsers(req.form, cb);
      },
      (users, cb) => {
        cb(null, users.docs.map(user => {

          return {
            'Username': user.username,
            'ETH balance': Services.currency.convertCurrency(user.wallet.balance),
            'Games Played': user.gamesCounter,
            'Last seen': `${moment(user.updatedAt).utc().format('DD MMM YYYY HH:mm')} UTC`
          };
        }), Object.keys(users.docs[0]));
      }
    ], (err, users, keys) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).csv(users, keys);
    });
  }

  getUserInfo(req, res) {

    async.parallel({

      userInfo: cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.user.findOneFull({ _id: req.form.id}, [
          'username',
          'selectedAvatar',
          'customAvatarFilename',
          'email',
          'wallet.balance',
          'updatedAt',
          'createdAt',
          'gamesCounter',
          'isBlocked',
          'facebook'
        ], null, cb);
      },
      userGames: cb => Repositories.table.findFullGameInfo(req.form.id, req.form, cb),
      userTxs: cb => Repositories.history.paginateUserHistory(req.form.id, req.form, cb),
      gameList: cb => Repositories.game.findFull({}, ['name'], null, cb)
    }, (err, result) => {

      if (err) {
        return res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  }

  getAllGames(req, res) {

    async.parallel({

      gameList: cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.table.findFullGameInfo(req.form.id, req.form, cb);
      },
      gamesInfo: cb => Repositories.game.findFull({}, ['name'], null, cb)
    }, (err, result) => {

      if (err) {
        return res.status(400).json(err);
      }

      res.status(200).json(result);
    });
  }

  paginateGames(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.table.findFullGameInfo(req.form.id, req.form, cb);
      },

    ], (err, games) => {

      if (err){
        return res.status(400).json(err);
      }

      res.status(200).json(games);
    });
  }

  paginateTxs(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.history.paginateUserHistory(req.form.id, req.form, cb);
      }
    ], (err, txs) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).json(txs);
    });
  }

  downloadAllGamesAsCsv(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.table.findFullGameInfo(req.form.id, req.form, cb);
      },
      (games, cb) => {
        cb(null, games.docs.map(game => {

          return {
            'Game': game.gameId.name,
            'Pool': `Room #${game.roomId.sc_id} Pool #${game.sc_id}`,
            'Players': game.players.length,
            'Winner': game.status.completed ? game.players.reduce((winners, player) => {

              if (player.score === game.players[0].score) {
                winners.push(player.userId.username);
              }

              return winners;
            }, []).join(', ') : '-',
            'ETH prize': Services.currency.convertCurrency(game.roomId.fund),
            'Fee amount': Services.currency.convertCurrency(game.roomId.bet),
            'Date': `${moment(game.createdAt).utc().format('DD MMM YYYY HH:mm')} UTC`
          }
        }), Object.keys(games.docs[0]));
      }
    ], (err, games, keys) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).csv(games, keys)
    });
  }

  downloadAllTxsAsCsv(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.history.paginateUserHistory(req.form.id, req.form, cb);
      },
      (txs, cb) => {
        cb(null, txs.docs.map(tx => {

          return {
            'Type': tx.type,
            'ETH': Services.currency.convertCurrency(tx.amount),
            'Username': tx.userId ?tx.userId.username : '-',
            'Address': tx.toAddress,
            'Status': tx.status,
            'Date': `${moment(tx.createdAt).utc().format('DD MMM YYYY HH:mm')} UTC`
          }
        }), Object.keys(txs.docs[0]))
      },
    ], (err, txs, keys) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).csv(txs, keys);
    });
  }

  downloadGamesAsCsv(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.table.findFullGameInfo(req.form.id, req.form, cb);
      },
      (games, cb) => {
        cb(null, games.docs.map(game => {

          const currentUser = game.players.find(player => player.userId._id.toString() === req.form.id.toString());

          return {
            'Game': game.gameId.name,
            'Pool': `Room #${game.roomId.sc_id} Pool #${game.sc_id}`,
            'Players': game.players.length,
            'Rank': game.players
              .sort((a, b) => b.score - a.score)
              .reduce((ranks, player, index, array) => {

                if (currentUser.score === player.score) {
                  if (ranks[1]) {
                    ranks[1] = index + 1;
                  } else {
                    ranks.push(index + 1);
                  }
                }

                return ranks;
                }, []).join('-'),
            'Score': currentUser.score,
            'ETH fee': Services.currency.convertCurrency(game.roomId.bet),
            'Prize': Services.currency.convertCurrency(currentUser.prizes),
            'Date': `${moment(currentUser.startDate).utc().format('DD MMM YYYY HH:mm')} UTC`
          }
        }), Object.keys(games.docs[0]))
      },
    ], (err, games, keys) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).csv(games, keys);
    });
  }

  downloadTxsAsCsv(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.history.paginateUserHistory(req.form.id, req.form, cb);
      },
      (txs, cb) => {
        cb(null, txs.docs.map(tx => {

          return {
            'Type': tx.type,
            'ETH': Services.currency.convertCurrency(tx.amount),
            'Address': tx.toAddress,
            'Game': tx.game ? tx.game.name : '-',
            'Status': tx.status,
            'Date': `${moment(tx.createdAt).utc().format('DD MMM YYYY HH:mm')} UTC`
          }
        }), Object.keys(txs.docs[0]))
      },
    ], (err, txs, keys) => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).csv(txs, keys);
    });
  }

  blockUser(req, res) {

    async.waterfall([

      cb => {
        if(!req.form.isValid) return cb(req.form.getErorrs());

        Repositories.user.blockUser(req.form.id, req.form.blocked, cb);
      },
      cb => Repositories.session.destroyAllUserSessions(req.form.id, cb),
      cb => {
        Services.socket.emitUserBlocking(req.form.id, req.form.blocked);

        cb();
      }
    ], err => {

      if(err) {
        return res.status(400).json(err);
      }

      res.status(200).json();
    });
  }
}

module.exports = new AdminController();
