"use strict";

const utils = require("../");
const repl = require("repl");
const sinon = require("sinon");
const chai = require("chai");
const should = chai.should();
const plugins = { sinon: require("sinon-chai") };

chai.use(plugins.sinon);

describe("startRepl", function () {
  it("should be a function", function () {
    utils.startRepl.should.be.a.function;
  });

  it(
    'should log "Starting REPL session"',
    sinon.test(function () {
      let startRepl = utils.startRepl;
      let log = this.spy(console, "log");

      startRepl("nodeos >");

      log.should.have.been.calledOnce;
      log.should.have.been.calledWith("Starting REPL session");
    })
  );

  it(
    "should start a repl",
    sinon.test(function () {
      let startRepl = utils.startRepl;
      let start = this.stub(repl, "start");
      let on = this.spy();

      start.withArgs("nodeos> ").returns({ on: on });

      startRepl("nodeos");

      start.should.have.been.calledOnce;
      start.should.have.been.calledWith("nodeos> ");
      start.should.have.returned(sinon.match.object);
      on.should.have.been.calledOnce;
      on.should.have.been.calledWith("exit", sinon.match.func);
    })
  );

  it(
    'should call process.exit(2) and print "Got exit event from repl!"',
    sinon.test(function () {
      let startRepl = utils.startRepl;
      let start = this.stub(repl, "start");
      let log = this.stub(console, "log");
      let on = this.stub();
      let exit = this.stub(process, "exit");

      start.withArgs("nodeos> ").returns({ on: on });
      on.withArgs("exit", sinon.match.func).yields();
      exit.withArgs(2).returns();

      startRepl("nodeos");

      log.should.have.been.calledWith("Starting REPL session");

      start.should.have.been.calledOnce;
      start.should.have.been.calledWith("nodeos> ");
      start.should.have.returned(sinon.match.object);

      on.should.have.been.calledOnce;
      on.should.have.been.calledWith("exit", sinon.match.func);

      log.should.have.been.calledWith('Got "exit" event from repl!');
      log.should.have.been.calledTwice;

      exit.should.have.been.calledWith(2);
    })
  );
});
