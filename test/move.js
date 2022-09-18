'use strict'

const fs = require('fs')
const utils = require('../')
const chai = require('chai')
const sinon = require('sinon')
const Error = require('errno-codes')
const Mount = require('mount-node')
const should = chai.should()
const plugins = {
  sinon: require('sinon-chai')
}

chai.use(plugins.sinon)

describe('move', function () {

  let ENOENT = Error.get(Error.ENOENT)
  let UNKNOWN = Error.get(Error.UNKNOWN)

  it('should be a function', function () {
    utils.move.should.be.a.function
  });

  it('should mount a source to a target', sinon.test(function () {
    let move = utils.move
    let callback = this.spy()
    let mount = this.stub(Mount, 'mount')

    mount.withArgs('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func).yields()

    move('/source', '/target', callback)

    mount.should.have.been.calledOnce
    mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func)
  }));

  it('should try to mount a source to a target but return a error', sinon.test(function () {
    let move = utils.move
    let callback = this.spy()
    let mount = this.stub(Mount, 'mount')

    mount.withArgs('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func).yields(UNKNOWN)

    move('/source', '/target', callback)

    mount.should.have.been.calledOnce
    mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func)
    callback.should.have.been.calledOnce
    callback.should.have.been.calledWithExactly(UNKNOWN)
  }));

  it('should read the source directory', sinon.test(function () {
    let move = utils.move
    let callback = this.spy()
    let mount = this.stub(Mount, 'mount')
    let readdir = this.stub(fs, 'readdir')

    mount.withArgs('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func).yields()
    readdir.withArgs('/source', sinon.match.func).yields(null, [])

    move('/source', '/target', callback)

    mount.should.have.been.calledOnce
    mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func)

    readdir.should.have.been.calledOnce
    readdir.should.have.been.calledWith('/source', sinon.match.func)
  }));

  it('should try to read the source directory but return a error', sinon.test(function () {
    let move = utils.move
    let callback = this.spy()
    let mount = this.stub(Mount, 'mount')
    let readdir = this.stub(fs, 'readdir')
    let rmdir = this.stub(fs, 'rmdir')

    mount.withArgs('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func).yields()
    readdir.withArgs('/source', sinon.match.func).yields(null, [])
    rmdir.withArgs('/source', callback).yields()

    move('/source', '/target', callback)

    mount.should.have.been.calledOnce
    mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func)

    readdir.should.have.been.calledOnce
    readdir.should.have.been.calledWith('/source', sinon.match.func)
  }));

  it('should check if any files are in this directory and return the callback',
    sinon.test(function () {
      let move = utils.move
      let callback = this.spy()
      let mount = this.stub(Mount, 'mount')
      let readdir = this.stub(fs, 'readdir')
      let rmdir = this.stub(fs, 'rmdir')

      mount.withArgs('/target', Mount.MS_MOVE, {
        devFile: '/source'
      }, sinon.match.func).yields()
      readdir.withArgs('/source', sinon.match.func).yields(null, ['/file1.ext'])
      rmdir.withArgs('/source', callback).yields()

      move('/source', '/target', callback)

      mount.should.have.been.calledOnce
      mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
        devFile: '/source'
      }, sinon.match.func)

      readdir.should.have.been.calledOnce
      readdir.should.have.been.calledWith('/source', sinon.match.func)

      callback.should.have.been.calledOnce
      callback.should.have.been.calledWith()
    }));

  it('should remove the source directory', sinon.test(function () {
    let move = utils.move
    let callback = this.spy()
    let mount = this.stub(Mount, 'mount')
    let readdir = this.stub(fs, 'readdir')
    let rmdir = this.stub(fs, 'rmdir')

    mount.withArgs('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func).yields()
    readdir.withArgs('/source', sinon.match.func).yields(null, [])
    rmdir.withArgs('/source', callback).yields()

    move('/source', '/target', callback)

    mount.should.have.been.calledOnce
    mount.should.have.been.calledWith('/target', Mount.MS_MOVE, {
      devFile: '/source'
    }, sinon.match.func)

    readdir.should.have.been.calledOnce
    readdir.should.have.been.calledWith('/source', sinon.match.func)

    rmdir.should.have.been.calledWith('/source', callback)

    callback.should.have.been.calledOnce
    callback.should.have.been.calledWith()
  }));
});