import express from 'express'
import path from 'path'

/* Webpack for development only */
import webpack from 'webpack'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../../webpack.config'

/* React Router Server */
import React from 'react'
import {renderToString} from 'react-dom/server'
import {match, RouterContext} from 'react-router'
import {Provider} from 'react-redux'

import routes, {store} from '../app/routes'

const app = express();

/* Setting up views */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/dist'))

/* Setting up webpack middlewares for development */
const compiler = webpack(webpackConfig)

app.use(devMiddleware(compiler, {stats: { colors: true }}))
app.use(hotMiddleware(compiler))

app.use((req, res, next) => {
  match({ 
    routes, 
    location : req.url
  }, (error, redirectLocation, renderProps) => {
    if(renderProps) {
      store.dispatch({
        type : 'INITIALIZE_APP'
      })

      const content = renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps}/>
        </Provider>
      )

      const state   = JSON.stringify(store.getState());
      res.render('index', {content, state})
      res.end()
    }
  })
})

/* Starting Server */
app.listen(4000, ()=> {
	console.log("Server started at 4000")
})