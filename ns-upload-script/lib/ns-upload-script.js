'use babel';

import {
  CompositeDisposable
} from 'atom'
import request from 'request'
import packageConfig from './config-schema.json'
import os from 'os'
import path from 'path'
import fs from 'fs'
import parser from 'xml2js'

export default {

  subscriptions: null,
  config: packageConfig,

  activate() {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ns-upload-script:upload': () => this.upload()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  upload() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      editor.save()
      let selection = editor.getText()
      let pathScript = path.resolve(this.getCurrentPath(), 'project.xml');
      var dirName = "";
      if (fs.existsSync(pathScript)) {
        var data = fs.readFileSync(pathScript, "utf8");
        parser.parseString(data, function(err, result) {
          dirName = result.project.folder[0]['$'].name;
        });
      } else {
        atom.notifications.addWarning('No existe el archivo de configuración: project.xml')
        dirName = this.getCurrentPath().split(path.sep).pop();
        atom.notifications.addWarning('Se tomará la carpeta actual para Netsuite: ' + dirName)
      }

      var jsonParams = {
        folder: dirName,
        file: atom.workspace.getActiveTextEditor().getTitle(),
        content: selection
      }

      atom.notifications.addSuccess('Enviando script');
      this.download(jsonParams).then((jsonResponse) => {
        atom.notifications.addSuccess(jsonResponse.response);
      }).catch((error) => {
        atom.notifications.addWarning(error.reason)
      });
    }
  },

  getCurrentPath() {
    if (!atom.workspace.getActiveTextEditor()) {
      return;
    }
    return path.dirname(String(atom.workspace.getActiveTextEditor().getURI()));
  },

  download(jsonParams) {
    return new Promise((resolve, reject) => {
      var url = atom.config.get('ns-upload-script.url');
      var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'NLAuth nlauth_account=' + atom.config.get('ns-upload-script.account') +
          ', nlauth_email=' + atom.config.get('ns-upload-script.email') +
          ', nlauth_signature=' + atom.config.get('ns-upload-script.password') +
          ', nlauth_role=' + atom.config.get('ns-upload-script.role')
      };

      request({
        uri: url,
        method: 'POST',
        headers: headers,
        form: "",
        json: jsonParams
      }, (error, response, body) => {
        console.log(error);
        console.log(response);
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Hubo un error al subir el script'
          })
        }
      })
    })
  }
};