/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/pages/Dashboard/index.js":
/*!**************************************!*\
  !*** ./src/pages/Dashboard/index.js ***!
  \**************************************/
/***/ (() => {

eval("const date = document.querySelector(\".date\")\r\nconst time = document.querySelector(\".time\")\r\n\r\n\r\n\r\ndocument.addEventListener(\"DOMContentLoaded\",function(){\r\n    function updateClock(){\r\n        let currentTime = new Date();\r\n        let hours = currentTime.getHours()\r\n        let minutes = currentTime.getMinutes()\r\n        let seconds = currentTime.getSeconds()\r\n        let ampm = hours >= 12 ? 'PM' : 'AM'\r\n        let updatedTime = `${hours}:${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds} ${ampm}`;\r\n        \r\n        time.textContent = updatedTime;\r\n        date.textContent = currentTime.toDateString()\r\n    }\r\n    updateClock()\r\n    setInterval(updateClock,1000)\r\n})\n\n//# sourceURL=webpack://pos-system/./src/pages/Dashboard/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/pages/Dashboard/index.js"]();
/******/ 	
/******/ })()
;