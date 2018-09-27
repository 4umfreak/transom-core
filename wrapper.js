'use strict';

module.exports = {
    wrapServer: function(_restify, _registry) {
        const server = {
            get registry() {
                // Post-initialize registry access.
                return _registry;
            },
            get restify(){
                return _restify;
            },
            get name(){
                return _restify.name;
            },
            set name(value){
                return _restify.name = value;
            },
            get url(){
                return _restify.url;
            },
            set url(value){
                return _restify.url = value;
            },
            get domain(){
                return _restify.domain;
            },
            set domain(value){
                return _restify.domain = value;
            },
            get log(){
                return _restify.log;
            },
            set log(value){
                return _restify.log = value;
            },
            get(...args) {
                return _restify.get(...args);
            },
            head(...args) {
                return _restify.head(...args);
            },
            post(...args) {
                return _restify.post(...args);
            },
            put(...args) {
                return _restify.put(...args);
            },
            patch(...args) {
                return _restify.patch(...args);
            },
            del(...args) {
                return _restify.del(...args);
            },
            opts(...args) {
                return _restify.opts(...args);
            },
            pre(...args) {
                return _restify.pre(...args);
            },
            use(...args) {
                return _restify.use(...args);
            },
            listen(...args) {
                return _restify.listen(...args);
            },
            close(...args) {
                return _restify.listen(...args);
            },
            on(...args) {
                return _restify.on(...args);
            }
        };
        return server;
    }
};