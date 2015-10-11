'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');

router.post('/publish', function (req, res, next) {
  // console.log(req.body);
  // console.log({
  //   content: {
  //     name: req.body['content[name]'],
  //     location: req.body['content[location][]'],
  //     radius: Number(req.body['content[radius]']),
  //     colour: req.body['content[colour]']
  //   }
  // });
  console.log(JSON.stringify({
    content: {
      name: req.body['content[name]'],
      location: req.body['content[location][]'],
      radius: Number(req.body['content[radius]']),
      colour: req.body['content[colour]']
    }
  }));
  request({
    method: 'POST',
    url: 'https://prod-mmx-001.magnet.com:5221/mmxmgmt/api/v1/topics/agar.me/publish',
    body: JSON.stringify({
      content: {
        name: req.body['content[name]'],
        location: req.body['content[location][]'],
        radius: Number(req.body['content[radius]']),
        colour: req.body['content[colour]']
      }
    }),
    // body: {
    //   content: {
    //     name: req.body['content[name]'],
    //     location: req.body['content[location][]'],
    //     radius: Number(req.body['content[radius]']),
    //     colour: req.body['content[colour]']
    //   }
    //     // "content[name]": req.body['content[name]'],
    //     // "content[location]": req.body['content[location][]'],
    //     // "content[radius]": Number(req.body['content[radius]']),
    //     // "content[colour]": req.body['content[colour]']
    // },
    // json: true,
    headers: {
      "X-mmx-app-id": "7yyifl20zg2",
      "X-mmx-api-key": "f6526236-eac9-4f17-ae53-81ca2564840a",
      "Content-Type": "application/json"
    }
  }, function (error, response, body) {
    if (error) {
      console.log(error);
    }
    // console.log(response);
    res.status(200).send(JSON.stringify(body, null, '\t'));
  });
});

module.exports = router;
