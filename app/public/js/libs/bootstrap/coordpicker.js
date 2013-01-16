!function($){

    var tpl = '<div class="coordpicker-dialog well form-inline span3">'
        +         '<input type="text" class="input-small" placeholder="longitude" data-name="longitude" /> '
        +         '<input type="text" class="input-small" placeholder="latitude" data-name="latitude" /> '
        //+         '<label class="checkbox">'
        //+             'Or'
        //+         '</label>'
        +         '<input type="text" class="input-address" placeholder="address" data-name="address" />'
        +     '</div>';

    $.fn.coordpicker = function ( option ) {
        return this.each(function () {

            var el = $(this),
                picker = $(tpl).hide()
                    .appendTo(el.parent()),
                data = el.data('coordpicker'),
                closed = true;
                //needRecalc = false;

            function setVal() {
                var v = data.longitude + ', ' + data.latitude;
                if(data.address) {
                    v = data.address + ' (' + v + ')';
                }
                el.val(v);
            }

            picker.find('input').on('change keyup', function() {
                //needRecalc = $(this).data('name') == 'address';
                data[$(this).data('name')] = $(this).val();
                setVal();
            });
            setVal();

            picker.find('input[data-name="address"]').on('change', function() {
                ymaps.geocode(data.address, {results:1}).then(function(res){
                    var coords = res.geoObjects.get(0).geometry.getCoordinates();
                    data.longitude = coords[0];
                    data.latitude = coords[1];
                    setVal();
                    picker.find('input').each(function(i) {
                        $(this).val(data[$(this).data('name')]);
                    });
                });
            })

            el.on({
                'focus': function() {
                    picker.find('input').each(function(i) {
                        $(this).val(data[$(this).data('name')]);
                    });
                    picker.show();
                    closed = false;
                    var offset = el.offset();
                    picker.css({
                        top: offset.top + $(el).height() + 18,
                        left: offset.left
                    });
                }
                //'keyup': $.proxy(this.update, this)
            });

            el.addClass('uneditable-input').attr('readonly', true).css({cursor: 'pointer'});


            picker.click(function() {
                return false;
            });

            $('body').click(function(e) {
                if(!$(e.target).is(el)) {
                    if(!closed) {
                        /*if(needRecalc) {
                            ymaps.geocode(data.address, {results:1}).then(function(res){
                                var coords = res.geoObjects.get(0).geometry.getCoordinates();
                                data.longitude = coords[0];
                                data.latitude = coords[1];
                                needRecalc = false;
                                setVal();
                                picker.hide();
                                el.trigger('coordpicker-change');
                            });
                        } else {*/
                            picker.hide();
                            el.trigger('coordpicker-change');
                        //}
                    }
                    closed = true;
                }
            });

        });
    }
}(window.jQuery);
