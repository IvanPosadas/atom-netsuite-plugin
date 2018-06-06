/**
 * @NApiVersion 2.0
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/file', 'N/search'],

  function(log, file, search) {

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
      log.error({
        title: 'RESTlet Upload script',
        details: 'get'
      });
      return 'Hello World!'
    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {
      log.error({
        title: 'RESTlet Upload script',
        details: 'put'
      });
      return 'Hello World!';
    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
      try {
        var folderSearchObj = search.create({
          type: "folder",
          filters: [
            ["name", "is", requestBody.folder],
            "AND", ["file.name", "is", requestBody.file]
          ],
          columns: [
            search.createColumn({
              name: "internalid",
              join: "file"
            }),
            "internalid"
          ]
        });

        var searchResultCount = folderSearchObj.runPaged().count;
        if (searchResultCount == 0) {
          folderSearchObj = search.create({
            type: "folder",
            filters: [
              ["name", "is", requestBody.folder]
            ],
            columns: [
              "internalid"
            ]
          });
          searchResultCount = folderSearchObj.runPaged().count;
          if (searchResultCount === 0) {
            return {
              reponse: "No existe la carpeta definida en project.xml"
            };
          } else if (searchResultCount > 1) {
            return {
              reponse: "Existe más de una carpeta. Verifique la configuración"
            };
          }
          folderSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results
            var fileObj = file.create({
              name: requestBody.file,
              fileType: file.Type.JAVASCRIPT,
              contents: requestBody.content
            });
            fileObj.folder = result.getValue({
              name: "internalid"
            });
            var fileId = fileObj.save();

            return true;
          });
          return {
            reponse: "Script creado satisfactoriamente"
          };
        } else if (searchResultCount > 2) {
          return {
            reponse: "Existe más de un archivo. Verifique la configuración."
          };
        } else {
          folderSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results
            var fileObj = file.create({
              name: requestBody.file,
              fileType: file.Type.JAVASCRIPT,
              contents: requestBody.content
            });
            fileObj.folder = result.getValue({
              name: "internalid"
            });
            var fileId = fileObj.save();

            return true;
          });
          return {
            response: 'Script Actualizado'
          };
        }
      } catch (e) {
        log.error({
          title: 'RESTlet Upload script',
          details: JSON.stringify(e)
        });
        return {
          response: e.message
        };
      }
    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {
      log.error({
        title: 'RESTlet Upload script',
        details: 'delete'
      });
      return 'Hello World!';
    }

    return {
      get: doGet,
      put: doPut,
      post: doPost,
      delete: doDelete
    };

  });