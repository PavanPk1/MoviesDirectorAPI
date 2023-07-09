const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const databasePath = path.join(__dirname, "moviesData.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1 GET METHOD
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT 
        movie_name as movieName
            FROM movie;`;
  const movieNames = await db.all(getMovieNamesQuery);
  response.send(movieNames);
});
//API 2 POST (add/create) METHOD
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const getNewMovieQuery = `
  INSERT 
    INTO 
        movie (director_id,movie_name,lead_actor) 
        VALUES (${directorId},'${movieName}','${leadActor}');`;
  await db.run(getNewMovieQuery);
  response.send("Movie Successfully Added");
});
//API 3 GET METHOD
const convertToCameCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * FROM movie where movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertToCameCase(movie));
});
//API 4 PUT METHOD
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE 
    movie 
  SET 
  movie_name = '${movieName}',
  director_id = ${directorId},
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API 5 DELETE METHOD
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `
    DELETE FROM movie
    WHERE movie_id = '${movieId}'`;
  await db.run(movieDeleteQuery);
  response.send("Movie Removed");
});
//API 6 GET METHOD
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;
  const directors = await db.all(getDirectorsQuery);
  response.send(
    directors.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});
//API 7 GET METHOD
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `
    SELECT movie_name as movieName FROM movie 
    where director_id = '${directorId}';`;
  const movies = await db.all(getMovieNames);
  response.send(movies);
});

module.exports = app;
