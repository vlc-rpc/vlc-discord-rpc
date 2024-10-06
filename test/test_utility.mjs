import { askMediaType, checkDetailLength, setSmallImageKey } from '../Functions/utilityFunctions.js';
import { expect } from 'chai';
import { iconNames } from '../Storage/config.js';
import readline from 'readline';
import sinon from 'sinon';

function resetModules() {
  sinon.restore();
}

describe('Return details object of appropriate length', function() {
  it('should correctly return "Unknown" for an empty string', function() {
    const details = checkDetailLength('');
    expect(details).to.equal('Unknown');
  });

  it('should correctly return "Unknown" for null', function() {
    const details = checkDetailLength(null);
    expect(details).to.equal('Unknown');
  });

  it('should return the same string if the length is between 2 and 125 characters', function() {
    const input = 'This is a valid string';
    const details = checkDetailLength(input);
    expect(details).to.equal(input);
  });

  it('should truncate the string if the length is greater than 125 characters', function() {
    const input = 'a'.repeat(130);
    const expected = `${'a'.repeat(125)  }...`;
    const details = checkDetailLength(input);
    expect(details).to.equal(expected);
  });

  it('should pad the string with dots if the length is less than 2 characters', function() {
    const details = checkDetailLength('a');
    expect(details).to.equal('a.');
  });

  it('should not modify the string if it is exactly 2 characters long', function() {
    const details = checkDetailLength('ab');
    expect(details).to.equal('ab');
  });

  it('should handle non-string values (like numbers) gracefully by returning "Unknown"', function() {
    const details = checkDetailLength(123);
    expect(details).to.equal('Unknown');
  });

  it('should return "Unknown" if details is an empty array', function() {
    const details = checkDetailLength([]);
    expect(details).to.equal('Unknown');
  });

  it('should correctly handle objects by returning "Unknown"', function() {
    const details = checkDetailLength({});
    expect(details).to.equal('Unknown');
  });
});

describe('It should correctly set the small image', function() {
  it('Should correctly return the playing image', function() {
    const status = { state: 'playing' };
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.playing);
  });

  it('Should correctly return the paused image', function() {
    const status = { state: 'paused' };
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.pause);
  });

  it('Should correctly return the VLC default image for unknown state', function() {
    const status = { state: 'unknown' };
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.vlc);
  });
});

describe('It should correctly return the media type after asking the user', function() {
  beforeEach(() => {
    resetModules();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should correctly get show media type (abberviated)', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('s');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('show');

    readline.createInterface.restore();
  }); 

  it('should correctly get show movie type (abbreviated)', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('m');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('movie');

    readline.createInterface.restore();
  }); 

  it('should correctly get show video type (abbreviated)', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('v');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('video');

    readline.createInterface.restore();
  });

  it('should correctly get show media type', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('show');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('show');

    readline.createInterface.restore();
  }); 

  it('should correctly get show movie type', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('movie');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('movie');

    readline.createInterface.restore();
  }); 

  it('should correctly get show video type', async function() {

    const readlineInterfaceStub = {
      question: sinon.stub().callsFake((query, callback) => {
        callback('video');
      }),
      close: sinon.stub().callsFake(() => {}) 
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('video');

    readline.createInterface.restore();
  }); 

  it('should handle invalid input and re-prompt the user (show)', async function() {
    const readlineInterfaceStub = {
      question: sinon.stub()

        .onFirstCall().callsFake((query, callback) => {
          callback('x');
        })

        .onSecondCall().callsFake((query, callback) => {
          callback('s');
        }),
      close: sinon.stub().callsFake(() => {})
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('show');
    expect(readlineInterfaceStub.question.callCount).to.equal(2); 

    readline.createInterface.restore();
  });

  it('should handle invalid input and re-prompt the user (video)', async function() {
    const readlineInterfaceStub = {
      question: sinon.stub()

        .onFirstCall().callsFake((query, callback) => {
          callback('x');
        })

        .onSecondCall().callsFake((query, callback) => {
          callback('v');
        }),
      close: sinon.stub().callsFake(() => {})
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('video');
    expect(readlineInterfaceStub.question.callCount).to.equal(2); 

    readline.createInterface.restore();
  });

  it('should handle invalid input and re-prompt the user (movie)', async function() {
    const readlineInterfaceStub = {
      question: sinon.stub()

        .onFirstCall().callsFake((query, callback) => {
          callback('x');
        })

        .onSecondCall().callsFake((query, callback) => {
          callback('m');
        }),
      close: sinon.stub().callsFake(() => {})
    };

    sinon.stub(readline, 'createInterface').returns(readlineInterfaceStub);

    const result = await askMediaType();

    expect(result).to.equal('movie');
    expect(readlineInterfaceStub.question.callCount).to.equal(2); 

    readline.createInterface.restore();
  });
});