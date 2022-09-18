"use strict";

const fs = require("fs");
const utils = require("../");
const chai = require("chai");
const sinon = require("sinon");
const Error = require("errno-codes");
const Mount = require("mount-node");
const should = chai.should();
const plugins = { sinon: require("sinon-chai") };

chai.use(plugins.sinon);

describe("moveSync", function () {
  let ENOENT = Error.get(Error.ENOENT);
  let UNKNOWN = Error.get(Error.UNKNOWN);

  it("should be a function", function () {
    utils.move.should.be.a.function;
  });

  it(
    "should mount the source to the target synchronously",
    sinon.test(function () {
      let moveSync = utils.moveSync;
      let callback = this.spy();
      let mountSync = this.stub(Mount, "mountSync");
      let readdirSync = this.stub(fs, "readdirSync");
      let rmdirSync = this.stub(fs, "rmdirSync");

      mountSync.withArgs("/source", "/target", Mount.MS_MOVE).returns();
      readdirSync.withArgs("/source").returns({ length: 0 });
      rmdirSync.withArgs("/source").returns();

      moveSync("/source", "/target");

      mountSync.should.have.been.calledOnce;
      mountSync.should.have.been.calledWith("/target", Mount.MS_MOVE, {
        devFile: "/source",
      });
      mountSync.should.not.have.thrown(ENOENT);
      mountSync.should.not.have.thrown(UNKNOWN);
    })
  );

  it(
    "should try to mount the source and throw a error",
    sinon.test(function () {
      let moveSync = utils.moveSync;
      let callback = this.spy();
      let mountSync = this.stub(Mount, "mountSync");
      let readdirSync = this.stub(fs, "readdirSync");
      let rmdirSync = this.stub(fs, "rmdirSync");

      mountSync.withArgs("/source", "/target", Mount.MS_MOVE).throws(UNKNOWN);
      readdirSync.withArgs("/source").returns({ length: 0 });
      rmdirSync.withArgs("/source").returns();

      try {
        moveSync("/source", "/target");
      } catch (e) {
        mountSync.should.have.been.calledOnce;
        mountSync.should.have.been.calledWith(
          "/source",
          "/target",
          Mount.MS_MOVE
        );
        mountSync.should.have.thrown(e);
      }
    })
  );

  it(
    "should readdirSync the source and check its length",
    sinon.test(function () {
      let moveSync = utils.moveSync;
      let callback = this.spy();
      let mountSync = this.stub(Mount, "mountSync");
      let readdirSync = this.stub(fs, "readdirSync");
      let rmdirSync = this.stub(fs, "rmdirSync");

      mountSync.withArgs("/source", "/target", Mount.MS_MOVE).returns();
      readdirSync.withArgs("/source").returns({ length: 0 });
      rmdirSync.withArgs("/source").returns();

      try {
        moveSync("/source", "/target");
      } catch (e) {}
      mountSync.should.have.been.calledOnce;
      mountSync.should.have.been.calledWith("/target", Mount.MS_MOVE, {
        devFile: "/source",
      });

      readdirSync.should.have.been.calledOnce;
      readdirSync.should.have.been.calledWith("/source");
      readdirSync.should.have.returned({ length: 0 });

      rmdirSync.should.have.been.calledOnce;
      rmdirSync.should.have.been.calledWith("/source");
    })
  );
  
  it(
    "should readdirSync the source and do nothing if its not zero",
    sinon.test(function () {
      let moveSync = utils.moveSync;
      let callback = this.spy();
      let mountSync = this.stub(Mount, "mountSync");
      let readdirSync = this.stub(fs, "readdirSync");
      let rmdirSync = this.stub(fs, "rmdirSync");

      mountSync.withArgs("/source", "/target", Mount.MS_MOVE).returns();
      readdirSync.withArgs("/source").returns({ length: 1 });
      rmdirSync.withArgs("/source").returns();

      try {
        moveSync("/source", "/target");
      } catch (e) {}
      mountSync.should.have.been.calledOnce;
      mountSync.should.have.been.calledWith("/target", Mount.MS_MOVE, {
        devFile: "/source",
      });

      readdirSync.should.have.been.calledOnce;
      readdirSync.should.have.been.calledWith("/source");
      readdirSync.should.have.returned({ length: 1 });

      rmdirSync.should.not.have.been.calledOnce;
      rmdirSync.should.not.have.been.calledWith("/source");
    })
  );
});
