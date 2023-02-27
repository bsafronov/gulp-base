import gulp from "gulp";
import { path } from "./config/path.js";

global.app = {
  isDev: !process.argv.includes('--build'),
  isBuild: process.argv.includes('--build'),
  path: path,
  gulp: gulp,
}

// Импорт задач
import { reset, copy, html, server, scss, js, img, 
  otfToTtf, ttfToWoff, fontsStyle, sprite, zip, ftp } from "./config/tasks.js";

// Наблюдатель событий
function watcher() {
  gulp.watch(path.watch.files, copy)
  gulp.watch(path.watch.html, html)
  gulp.watch(path.watch.scss, scss)
  gulp.watch(path.watch.js, js)
  gulp.watch(path.watch.img, img)
}

//Конвертация шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsStyle);

//Основные задачи
const mainTasks = gulp.series(fonts, gulp.parallel(copy, html, scss, js, img));

// Режим разработки/билда
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const build = gulp.series(reset, mainTasks, zip);
const deployFTP = gulp.series(reset, mainTasks, ftp);

// Сценарий по умолчанию
gulp.task('default', dev);

export { dev, build, sprite, deployFTP };