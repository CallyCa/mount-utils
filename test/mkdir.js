"use strict";

const mkdirp = require("mkdirp");
const utils = require("../");
const Error = require("errno-codes");
const sinon = require("sinon");
const chai = require("chai");
const should = chai.should();
const plugins = { sinon: require("sinon-chai") };

chai.use(plugins.sinon);

describe("mkdir", function () {
  // errors
  let UNKNOWN = Error.get(Error.UNKNOWN);
  let EEXIST = Error.get(Error.EEXIST);

  it("should be a function", function () {
    utils.mkdir.should.be.a.function;
  });

  it(
    "should try to create a folder with 0000 permissions",
    sinon.test(function () {
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdir = utils.mkdir;

      mkdirpAsync.withArgs("/path", "0000", sinon.match.func).yields();

      mkdir("/path", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWithExactly(
        "/path",
        "0000",
        sinon.match.func
      );

      callback.should.not.have.been.calledWith(UNKNOWN);
      callback.should.not.have.been.calledWith(EEXIST);

      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWithExactly();
    })
  );

  it(
    "should throw an error if it can't create the folder",
    sinon.test(function () {
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdir = utils.mkdir;

      mkdirpAsync.withArgs("/path", "0000").yields(UNKNOWN);

      mkdir("/path", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWithExactly(
        "/path",
        "0000",
        sinon.match.func
      );

      callback.should.have.been.calledOnce;
      callback.should.not.have.been.calledWith(EEXIST);
      callback.should.have.been.calledWithExactly(UNKNOWN);
    })
  );

  it(
    "should surpress an EEXIST error and return just the callback",
    sinon.test(function () {
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdir = utils.mkdir;

      mkdirpAsync.withArgs("/path", "0000").yields(EEXIST);

      mkdir("/path", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWithExactly(
        "/path",
        "0000",
        sinon.match.func
      );

      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWithExactly();
    })
  );
});
