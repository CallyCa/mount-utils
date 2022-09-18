"use strict";

const utils = require("../");
const Mount = require("mount-node");
const Error = require("errno-codes");
const mkdirp = require("mkdirp");
const sinon = require("sinon");
const chai = require("chai");
const should = chai.should();
const plugins = { sinon: require("sinon-chai") };

chai.use(plugins.sinon);

describe("mkdirMount", function () {
  let UNKNOWN = Error.get(Error.UNKNOWN);
  let EEXIST = Error.get(Error.EEXIST);

  it("should be a function", function () {
    utils.mkdirMount.should.be.a.function;
  });

  it(
    "should return a UNKNOWN error returned by mkdir",
    sinon.test(function () {
      let mount = this.stub(Mount, "mount");
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdirMount = utils.mkdirMount;

      mount.withArgs("/path", "type", callback).yields();
      mkdirpAsync.withArgs("/path", "0000").yields(UNKNOWN);

      mkdirMount("/path", "type", callback);

      mkdirpAsync.should.have.been.calledWith(
        "/path",
        "0000",
        sinon.match.func
      );

      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith(UNKNOWN);

      mount.should.not.have.been.calledOnce;
      mount.should.not.have.been.calledWith("/path", "type", callback);
    })
  );

  it(
    "should (ignore or not return) a EEXIST returned by mkdir",
    sinon.test(function () {
      let mount = this.stub(Mount, "mount");
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdirMount = utils.mkdirMount;

      mount.withArgs("/path", "type", null, null, callback).yields();
      mkdirpAsync.withArgs("/path", "0000").yields(EEXIST);

      mkdirMount("/path", "type", callback);

      mkdirpAsync.should.have.been.calledWith(
        "/path",
        "0000",
        sinon.match.func
      );

      callback.should.have.been.calledOnce;
      callback.should.not.have.been.calledWith(EEXIST);
      callback.should.have.been.calledWith();

      mount.should.have.been.calledOnce;
      mount.should.have.been.calledWith("/path", "type", null, null, callback);
    })
  );

  it(
    "should mount the created directory to a dev file",
    sinon.test(function () {
      let mount = this.stub(Mount, "mount");
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let callback = this.spy();
      let mkdirMount = utils.mkdirMount;

      mount.withArgs("/path", "type", null, null, callback).yields();
      mkdirpAsync.withArgs("/path", "0000").yields();

      mkdirMount("/path", "type", callback);

      callback.should.have.been.not.calledWith(UNKNOWN);
      callback.should.have.been.not.calledWith(EEXIST);
      mount.should.have.been.calledOnce;
      mount.should.have.been.calledWith("/path", "type", null, null, callback);

      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith();
      callback.should.have.been.calledAfter(mount);
    })
  );
});
