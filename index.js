var _ = require('lodash');
var path = require('path');
var through = require('through2');

function gulpClipper(fileName){

    var clipper = new Clipper();
    var latestFile;

    function populateClips(file, encoding, cb){
        latestFile=file;

        if(file.clipped){
            return cb();
        }
        file.clipped = true;

        clipper.clipString(''+file.contents);

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
    clipString: function(string){
        _.each(string.split('\n'), (line)=>{
            this.clipLine(line);
        });
        this.clearActiveClips();
    },
    clipLine: function(line){
        this.removeActiveClips(line);
        _.each(this.activeClips, (isActiveClip, clipTag)=>{
            this.clips[clipTag] = this.clips[clipTag] || [];
            this.clips[clipTag].push(line);
        });
        this.addActiveClips(line);
    },
    removeActiveClips: function(line){
        var stopClippingTag = _.get(this.stopRe.exec(line), '1');
        if(stopClippingTag){
            delete this.activeClips[stopClippingTag];
        }
    },
    addActiveClips: function(line){
        var startClippingTag = _.get(this.startRe.exec(line), '1');
        if(startClippingTag){
            this.activeClips[startClippingTag] = true;
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

module.exports = gulpClipper;