var _ = require('lodash');
var path = require('path');
var through = require('through2');

module.exports = gulpClipper;

function gulpClipper(fileName, options){
    fileName = fileName || 'gulpClips.js';
    var clipper = new Clipper(options);

    var latestFile;

    function populateClips(file, encoding, cb){
        latestFile=file;

        if(file.clipped){
            return cb();
        }
        file.clipped = true;

        clipper.processString(''+file.contents);

        return cb();
    }

    function endStream(cb){
        if (!latestFile) {
          return cb();
        }

        var joinedFile = latestFile.clone({contents: false});
        joinedFile.path = path.join(latestFile.base, fileName);

        var clipsJs = 'window.gulpClips = ' + JSON.stringify(clipper.getClips())+';';
        joinedFile.contents = new Buffer(clipsJs);
        this.length = 0;
        this.push(joinedFile);
        cb();
    }

    return through.obj(populateClips, endStream);
}


function Clipper(options){
    _.defaults(this, {
        clips: {},
        activeClips: {},
        startRe: /@gulpClipperStart:(.*):/,
        stopRe: /@gulpClipperStop:(.*):/,
    });
    _.extend(this, options);
}

Clipper.prototype = {
    processString: function(string){
        _.each(string.split('\n'), (line)=>{
            this.processLine(line);
        });
        this.clearActiveClips();
    },
    processLine: function(line){
        this.removeActiveClips(line);
        _.each(this.activeClips, (isActiveClip, clipTag)=>{
            this.clips[clipTag] = this.clips[clipTag] || [];
            this.clips[clipTag].push(line);
        });
        this.addActiveClips(line);
    },
    removeActiveClips: function(line){
        var stopClippingKey = _.get(this.stopRe.exec(line), '1');
        if(stopClippingKey){
            delete this.activeClips[stopClippingKey];
        }
    },
    addActiveClips: function(line){
        var startClippingKey = _.get(this.startRe.exec(line), '1');
        if(startClippingKey){
            this.activeClips[startClippingKey] = true;
        }
    },
    clearActiveClips: function(){
        this.activeClips = {};
    },
    getClips: function(){
        return _.mapValues(this.clips, function(value){
            return value.join('\n')
        });
    }
}