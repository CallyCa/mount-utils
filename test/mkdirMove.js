"use strict";

const fs = require("fs");
const chai = require("chai");
const Error = require("errno-codes");
const Mount = require("mount-node");
const mkdirp = require("mkdirp");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const utils = require("../");
const should = chai.should();
const plugins = { sinon: sinonChai };

chai.use(plugins.sinon);

describe("mkdirMove", function () {
  let UNKNOWN = Error.get(Error.UNKNOWN);
  let EEXIST = Error.get(Error.EEXIST);

  it("should be a function", function () {
    utils.mkdirMount.should.be.a.function;
  });

  it(
    "should create the target directory",
    sinon.test(function () {
      let mkdirMove = utils.mkdirMove;
      let callback = this.spy();
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let mount = this.stub(Mount, "mount");
      let readdir = this.stub(fs, "readdir");
      let rmdir = this.stub(fs, "rmdir");

      mkdirpAsync.withArgs("/target", "0000").yields();

      mkdirMove("/source", "/target", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWith("/target", "0000");
    })
  );

  it(
    "should return a error if the target directory cant be created",
    sinon.test(function () {
      let mkdirMove = utils.mkdirMove;
      let callback = this.spy();
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let mount = this.stub(Mount, "mount");
      let readdir = this.stub(fs, "readdir");
      let rmdir = this.stub(fs, "rmdir");

      mkdirpAsync.withArgs("/target", "0000").yields(UNKNOWN);

      mkdirMove("/source", "/target", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWith("/target", "0000");

      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith(UNKNOWN);
    })
  );

  it(
    "should move the files to the target directory",
    sinon.test(function () {
      let mkdirMove = utils.mkdirMove;
      let callback = this.spy();
      let mkdirpAsync = this.stub(mkdirp, "mkdirp");
      let mount = this.stub(Mount, "mount");
      let readdir = this.stub(fs, "readdir");
      let rmdir = this.stub(fs, "rmdir");

      mkdirpAsync.withArgs("/target", "0000").yields();
      mount
        .withArgs(
          "/target",
          mount.MS_MOVE,
          { devFile: "/source" },
          sinon.match.func
        )
        .yields();
      readdir.withArgs("/source", sinon.match.func).yields(null, []);
      rmdir.withArgs("/source", callback).yields();

      mkdirMove("/source", "/target", callback);

      mkdirpAsync.should.have.been.calledOnce;
      mkdirpAsync.should.have.been.calledWith("/target", "0000");
    })
  );
});
