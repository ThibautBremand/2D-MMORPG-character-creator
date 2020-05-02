_.mixin(_.str.exports());

$(document).ready(function() {

    // Get querystring paramters
    var params = jHash.val();

    // on hash (url) change event, interpret and redraw
    jHash.change(function() {
        params = jHash.val();
        interpretParams();
        redraw();
    });

    // set params and redraw when any radio button or checkbox is clicked on
    $("input[type=radio], input[type=checkbox]").each(function() {
        $(this).click(function() {
            setParams();
            redraw();
        });
    });

    // When radio button is unchecked, its children should be too.
    $("input[type=radio]").each(function() {
        $(this).change(function() {
            var name = $(this).attr("name");
            // Sadly we need to use setTimeout
            window.setTimeout(function() {
                $("li>span>input[name=" + name + "]").each(function() {
                    if (!($(this).prop("checked"))) {
                        var $this = $(this).parent();
                        $this.removeClass("expanded").addClass("condensed");
                        $this = $this.parent();
                        var $ul = $this.children("ul");
                        $ul.hide('slow');
                        $ul.find("input[type=checkbox]").each(function() {
                            $(this).prop("checked", false);
                        });
                    }
                });
                redraw();
            }, 0);
        });
    });

    // Do not multiple toggle when clicking on children
    $("#chooser>ul>li>ul>li>ul>li").click(function(event) {
        event.stopPropagation();
    });

    // Toggle display of a list elements children when clicked
    // Do not do so twice, once on label then on input
    // Again, do not multiple toggle when clicking on children
    $("#chooser>ul>li>ul>li").click(function(event) {
        if (!($(event.target).get(0).tagName == "LABEL")) {
            $(this).children("span").toggleClass("condensed").toggleClass("expanded");
            var $ul = $(this).children("ul");
            $ul.toggle('slow').promise().done(drawPreviews);
        }
        event.stopPropagation();
    });

    // Toggle display of a list elements children when clicked
    // Again, do not multiple toggle when clicking on children
    $("#chooser>ul>li").click(function(event) {
        $(this).children("span").toggleClass("condensed").toggleClass("expanded");
        var $ul = $(this).children("ul");
        $ul.toggle('slow').promise().done(drawPreviews);
        event.stopPropagation();
    });

    // When clicking on collapse all link, collapse all uls in #chooser
    $("#collapse").click(function() {
        $("#chooser>ul ul").hide('slow');
        $("#chooser>ul span.expanded").removeClass("expanded").addClass("condensed");
    });

    // Redraw afer reset
    $("input[type=reset]").click(function() {
        // Sadly we need to use setTimeout
        window.setTimeout(function() {
            params = {};
            jHash.val(params);
            redraw();
        }, 0, false);
    });

    var canvas = $("#spritesheet").get(0);
    var ctx = canvas.getContext("2d");

    function renameImageDownload(link, canvasItem, filename) {
        link.href = canvasItem.toDataURL();
        link.download = filename;
    };

    // Save canvas as PNG
    $("#saveAsPNG").click(function() {
        renameImageDownload(this, canvas, 'Download.png');
    });

    // Determine if an oversize element used
    var oversize = $("input[type=radio]").filter(function() {
        return $(this).data("oversize");
    }).length > 0;

    // Expand canvas if oversize element used
    if (oversize) {
        canvas.width = 1536;
        canvas.height = 1344 + 768;
    } else {
        canvas.width = 832;
        canvas.height = 1344;
    }
    $("#chooser>ul").css("height", canvas.height);

    // called each time redrawing
    function redraw() {

        // start over
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // determine if an oversize element is being used
        oversize = $("input[type=radio]:checked").filter(function() {
            return $(this).data("oversize");
        }).length > 0;

        // If an oversize element is being used, expand canvas,
        // otherwise return it to normal size
        if (oversize) {
            canvas.width = 1536;
            canvas.height = 1344 + 768;
        } else {
            canvas.width = 832;
            canvas.height = 1344;
        }
        $("#chooser>ul").css("height", canvas.height);
        oversize = !!oversize;

        // non oversize elements
        $("input[type=radio]:checked, input[type=checkbox]:checked").filter(function() {
            return !$(this).data("oversize");
        }).each(function(index) {

            // save this in closure
            var $this = $(this);

            // Determine if male or female selected
            var isMale = $("#sex-male").prop("checked");
            var isFemale = $("#sex-female").prop("checked");

            // if data-file specified
            if ($(this).data("file")) {
                var img = getImage($(this).data("file"));

                // if data-behind specified, draw behind existing pixels
                if ($(this).data("behind")) {
                    ctx.globalCompositeOperation = "destination-over";
                    drawImage(ctx, img);
                    ctx.globalCompositeOperation = "source-over";
                } else
                    drawImage(ctx, img);
            }

            // if data-file_behind specified
            if ($(this).data("file_behind")) {
                var img = getImage($(this).data("file_behind"));
                ctx.globalCompositeOperation = "destination-over";
                drawImage(ctx, img);
                ctx.globalCompositeOperation = "source-over";
            }

            // Deal with shield/chain hat overlap issue
            if ($(this).data("file_hat") && $("#hat_chain").prop("checked")) {
                var img = getImage($(this).data("file_hat"));
                drawImage(ctx, img);
            }
            if ($(this).data("file_no_hat") && !$("#hat_chain").prop("checked")) {
                var img = getImage($(this).data("file_no_hat"));
                drawImage(ctx, img);
            }

            // if data-file_male and data-file_female is specified
            if (isMale && $(this).data("file_male")) {
                var img = getImage($(this).data("file_male"));
                drawImage(ctx, img);
            }
            if (isFemale && $(this).data("file_female")) {
                var img = getImage($(this).data("file_female"));
                drawImage(ctx, img);
            }

            // if data-file_male_light... and data-file_female_light... is specified
            var bodytypes = ["light", "dark", "dark2", "tanned", "tanned2", "darkelf", "darkelf2"];
            if (isMale) {
                _.each(bodytypes, function(bodytype) {
                    if ($("#body-" + bodytype).prop("checked") && $this.data("file_male_" + bodytype)) {
                        var img = getImage($this.data("file_male_" + bodytype));
                        drawImage(ctx, img);
                    }
                });
            }
            if (isFemale) {
                _.each(bodytypes, function(bodytype) {
                    if ($("#body-" + bodytype).prop("checked") && $this.data("file_female_" + bodytype)) {
                        var img = getImage($this.data("file_female_" + bodytype));
                        drawImage(ctx, img);
                    }
                });
            }

            // Draw shadows for plain or ponytail2 hairstyles appropriate to body color
            var id = $(this).attr("id");
            if (_.startsWith(id, "hair-")) {
                var style = id.substring(5, id.indexOf("-", 5));
                $("input[type=radio]:checked").filter(function() {
                    return $(this).attr("id").substr(0, 5) == "body-";
                }).each(function() {
                    var hsMale = "hs_" + style + "_male";
                    var hsFemale = "hs_" + style + "_female";
                    if (isMale && $(this).data(hsMale)) {
                        var img = getImage($(this).data(hsMale))
                        drawImage(ctx, img);
                    }
                    if (isFemale && $(this).data(hsFemale)) {
                        var img = getImage($(this).data(hsFemale))
                        drawImage(ctx, img);
                    }
                });
            }
        });

        // Oversize weapons: Copy existing canvas poses to new locations
        // with 192x192 padding rather than 64x64
        // data-oversize="1" means thrust weapon
        // data-oversize="2" means slash weapon
        // use appropriate thrust or slash pose
        if (oversize) {
            $("input[type=radio]:checked").filter(function() {
                return $(this).data("oversize");
            }).each(function(index) {
                var type = $(this).data("oversize");
                if (type == 1) {
                    for (var i = 0; i < 8; ++i)
                        for (var j = 0; j < 4; ++j) {
                            var imgData = ctx.getImageData(64 * i, 264 + 64 * j, 64, 64);
                            ctx.putImageData(imgData, 64 + 192 * i, 1416 + 192 * j);
                        }
                    if ($(this).data("file")) {
                        var img = getImage($(this).data("file"));
                        ctx.drawImage(img, 0, 1344);
                    }
                } else if (type == 2) {
                    for (var i = 0; i < 6; ++i)
                        for (var j = 0; j < 4; ++j) {
                            var imgData = ctx.getImageData(64 * i, 776 + 64 * j, 64, 64);
                            ctx.putImageData(imgData, 64 + 192 * i, 1416 + 192 * j);
                        }
                    if ($("#sex-male").prop("checked") && $(this).data("file_male")) {
                        var img = getImage($(this).data("file_male"));
                        ctx.drawImage(img, 0, 1344);
                    }
                    if ($("#sex-female").prop("checked") && $(this).data("file_female")) {
                        var img = getImage($(this).data("file_female"));
                        ctx.drawImage(img, 0, 1344);
                    }
                }
            });
        }

        // Clear everything if illegal combination used
        // Probably should try to prevent this
        $("input[type=radio], input[type=checkbox]").each(function(index) {
            if ($(this).data("required")) {
                var requirements = $(this).data("required").split(",");
                var passed = true;
                _.each(requirements, function(req) {
                    var requirement = req.replace("=", "-");
                    if (!$("#" + requirement).prop("checked"))
                        passed = false;
                });
                if (passed)
                    $(this).prop("disabled", false);
                else {
                    $(this).prop("disabled", true);
                    if ($(this).prop("checked"))
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
            if ($(this).data("prohibited")) {
                var requirements = $(this).data("prohibited").split(",");
                var passed = true;
                _.each(requirements, function(req) {
                    var requirement = req.replace("=", "-");
                    if ($("#" + requirement).prop("checked"))
                        passed = false;
                });
                if (passed)
                    $(this).prop("disabled", false);
                else {
                    $(this).prop("disabled", true);
                    if ($(this).prop("checked"))
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        });
    }

    // Change checkboxes based on parameters
    function interpretParams() {
        $("input[type=radio]").each(function() {
            var words = _.words($(this).attr('id'), '-');
            var initial = _.initial(words).join('-');
            $(this).prop("checked", $(this).attr("checked") || params[initial] == _.last(words));
        });
        $("input[type=checkbox]").each(function() {
            $(this).prop("checked", _.toBool(params[$(this).attr('id')]));
        });
    }

    // Set parameters in response to click on any radio button or checkbox
    function setParams() {
        $("input[type=radio]:checked").each(function() {
            var words = _.words($(this).attr('id'), '-');
            var initial = _.initial(words).join('-');
            if (!$(this).attr("checked") || params[initial]) {
                params[initial] = _.last(words);
            }
        });
        $("input[type=checkbox]").each(function() {
            if (_.toBool($(this).attr("checked")) != $(this).prop("checked") ||
                _.toBool(params[$(this).attr('id')]) != $(this).prop("checked"))
                params[$(this).attr('id')] = $(this).prop("checked") ? 1 : 0;
        });
        jHash.val(params);
    }

    // Cache images
    var images = {};

    function getImage(imgRef) {
        if (images[imgRef])
            return images[imgRef];
        else {

            // Load image if not in cache
            var img = new Image();
            img.src = "admin/Universal-LPC-Spritesheet-Character-Generator/Universal-LPC-spritesheet/" + imgRef;
            img.onload = redraw;
            images[imgRef] = img;
            return img;
        }
    }

    function getImage2(imgRef, callback) {
        if (images[imgRef]) {
            callback(images[imgRef]);
            return images[imgRef];
        } else {

            // Load image if not in cache
            var img = new Image();
            img.src = "admin/Universal-LPC-Spritesheet-Character-Generator/Universal-LPC-spritesheet/" + imgRef;
            img.onload = function() { callback(img) };
            images[imgRef] = img;
            return img;
        }
    }

    // Do not stop running all javascript if image not available
    function drawImage(ctx, img) {
        try {
            ctx.drawImage(img, 0, 0);
        } catch(err) {
            console.error("Error: could not find " + img.src);
        }
    }

    // Draw now - on ready
    interpretParams();
    if (Object.keys(params).length == 0) {
        $("input[type=reset]").click();
        setParams();
    }
    redraw();

    // Draw preview images
    function drawPreviews() {
        this.find("input[type=radio], input[type=checkbox]").filter(function() {
            return $(this).is(":visible");
        }).each(function() {
            if (!$(this).parent().hasClass("hasPreview")) {
                var prev = document.createElement("canvas");
                var oversize = $(this).data("oversize");
                if (!oversize) {
                    prev.setAttribute("width", 64);
                    prev.setAttribute("height", 64);
                } else {
                    prev.setAttribute("width", 192);
                    prev.setAttribute("height", 192);
                }
                var prevctx = prev.getContext("2d");
                var img = null;
                var previewRow = $(this).data("preview_row");
                if (!previewRow)
                    previewRow = 10;
                else
                    previewRow = parseInt(previewRow);
                var callback = function(img) {
                    try {
                        if (oversize)
                            prevctx.drawImage(img, 0, 2 * 192, 192, 192, 0, 0, 192, 192);
                        else
                            prevctx.drawImage(img, 0, previewRow * 64, 64, 64, 0, 0, 64, 64);
                    } catch (err) {
                        console.log(err);
                    }
                };
                if ($(this).data("file"))
                    img = getImage2($(this).data("file"), callback);
                else if ($(this).data("file_male"))
                    img = getImage2($(this).data("file_male"), callback);
                else if ($(this).data("file_female"))
                    img = getImage2($(this).data("file_female"), callback);
                else if ($(this).data("file_male_light"))
                    img = getImage2($(this).data("file_male_light"), callback);
                else if ($(this).data("file_no_hat"))
                    img = getImage2($(this).data("file_no_hat"), callback);
                if (img != null) {
                    this.parentNode.insertBefore(prev, this);
                    $(this).parent().addClass("hasPreview").parent().addClass("hasPreview");
                }
            }
        });
    };

    // Preview Animation
    var anim = $("#previewAnimations").get(0);
    var animCtx = anim.getContext("2d");
    var $selectedAnim = $("#whichAnim>:selected");
    var animRowStart = parseInt($selectedAnim.data("row"));
    var animRowNum = parseInt($selectedAnim.data("num"));
    var animRowFrames = parseInt($selectedAnim.data("cycle"));
    var currentFrame = 0;

    $("#whichAnim").change(function() {
        $selectedAnim = $("#whichAnim>:selected");
        animRowStart = parseInt($selectedAnim.data("row"));
        animRowNum = parseInt($selectedAnim.data("num"));
        animRowFrames = parseInt($selectedAnim.data("cycle"));
        currentFrame = 0;
    });

    function nextFrame() {
        currentFrame = (currentFrame + 1) % animRowFrames;
        animCtx.clearRect(0, 0, anim.width, anim.height);
        for (var i = 0; i < animRowNum; ++i) {
            animCtx.drawImage(canvas, currentFrame * 64, (animRowStart + i) * 64, 64, 64, i * 64, 0, 64, 64);
        }
        setTimeout(nextFrame, 1000 / 8);
    }
    nextFrame();
});
