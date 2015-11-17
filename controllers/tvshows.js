//module.exports = function(app) {

var mongoose = require('mongoose');
var TVShow = mongoose.model('TVShow');

//GET - Return all tvshows in the DB
exports.findAllTVShows = function(req, res) {
    TVShow.find(function(err, tvshows) {
        if(!err) {
            res.send(tvshows);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Return a TVShow with specified ID
exports.findById = function(req, res) {
  TVShow.findById(req.params.id, function(err, tvshow) {
    if(!err) {
      res.send({
        show: tvshow,
        recommended: tvshow.recommended()
      });
    } else {
      console.log('ERROR: ' + err);
    }
  });
};

//Insertar yn nuevo tvshow en db
exports.addTVShow = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var tvshow = new TVShow({
    title:    req.body.title,
    year:     req.body.year,
    country:  req.body.country,
    poster:   req.body.poster,
    seasons:  req.body.seasons,
    genre:    req.body.genre,
    summary:  req.body.summary  
  });

  tvshow.save(function(err) {
    if(!err) {
      res.send(tvshow);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.updateTVShow = function(req, res) {
  TVShow.findById(req.params.id, function(err, tvshow) {
    tvshow.title   = req.body.title;
    tvshow.year    = req.body.year;
    tvshow.country = req.body.country;
    tvshow.poster  = req.body.poster;
    tvshow.seasons = req.body.seasons;
    tvshow.genre   = req.body.genre;
    tvshow.summary = req.body.summary;

    tvshow.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(tvshow);
    });
  });
};

exports.deleteTVShow = function(req, res) {
  TVShow.findById(req.params.id, function(err1, tvshow) {
    if (tvshow) {
      tvshow.remove(function(err2) {
        if(!err2) {
        console.log('Removed');
        res.send("Eliminado");
        } else {
        console.log('ERROR: ' + err2);
        }
      })
    }
    else
      console.log(err1);
  });
}

/*//Link de las rutas y funciones
app.get('/tvshows', findAllTVShows);
app.get('/tvshow/:id', findById);
app.post('/tvshow', addTVShow);
app.put('/tvshow/:id', updateTVShow);
app.delete('/tvshow/:id', deleteTVShow);

//}*/