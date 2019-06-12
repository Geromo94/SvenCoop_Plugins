var Extend = (function()
{
	var general =
	{
		type: function()
		{
			$.fn.type = function(data, mod)
			{
				var self = $(this);
				var type = '[data-type~="' + data + '"]';

				if(typeof(mod) == 'undefined')
				{
					return self.filter(type);
				}
				else if(mod == 'c')
				{
					return self.find(type);
				}
				else if(mod == 'p')
				{
					return self.parents(type);
				}
				else if(mod == 'a')
				{
					return self.next(type);
				}
				else if(mod == 'a+')
				{
					return self.nextAll(type);
				}
				else if(mod == 'b')
				{
					return self.prev(type);
				}
			}
		},
		vlen: function()
		{
			$.fn.vlen = function()
			{
				return $(this).val().length;
			}
		},
		array: function()
		{
			$.fn.pop = [].pop;
			$.fn.shift = [].shift;
			$.fn.reverse = [].reverse();
		},
		state: function()
		{
			this.type();
			this.vlen();
			this.array();
		}
	};

	general.state();
})();

var PopUp =
{
	general:
	{
		open: [],
		toggle: function(state, element, show, hide)
		{
			if(state == 'show')
			{
				element.show();
				this.open.push(element);

				if(typeof(show) != 'undefined')
				{
					show();
				}
			}

			if(state == 'hide')
			{
				element.hide();
				this.open.pop();

				if(typeof(hide) != 'undefined')
				{
					hide();
				}
			}
		},
		close: function(element, callback)
		{
			var that = this,
				area = element.type('close', 'c');

			area
			.click(function()
			{
				that.toggle('hide', element);

				if(typeof(callback) != 'undefined')
				{
					callback();
				}
			});
		},
		key: function()
		{
			var that = this;

			$(document)
			.keydown(function(e)
			{
				if(e.keyCode == 27)
				{
					e.preventDefault();

					var open = that.open[that.open.length - 1];

					if(that.open.length)
					{
						open
						.type('key', 'c')
						.trigger('click');
					}
				}
			});
		},
		state: function()
		{
			this.key();
		}
	},
	tip:
	{
		box:
		{
			element: $('.js_box').type('faq'),
			button: $('.js_tip').type('click'),
			toggle: function(name)
			{
				var block = this.element.type('block', 'c');

				block
				.hide()
				.type(name)
				.show();
			},
			link: function()
			{
				var that = this;

				this.button
				.click(function()
				{
					var self = $(this),
						name = self.data('name');

					function show()
					{
						that.toggle(name);
					}

					PopUp.general.toggle('show', that.element, show);
				});

				PopUp.general.close(that.element);
			},
			scroll: function()
			{
				var pane = this.element.type('scroll', 'c');

				pane
				.bind('jsp-scroll-y', function(event, scrollPositionY, isAtTop, isAtBottom)
				{
					var self = $(this);

					self.addClass('top bottom');

					if(isAtTop)
					{
						self.removeClass('top');
					}

					if(isAtBottom)
					{
						self.removeClass('bottom');
					}
				})
				.jScrollPane(
				{
					verticalGutter: 20,
					verticalDragMinHeight: 30,
					mouseWheelSpeed: 60,
					autoReinitialise: true
				});
			},
			state: function()
			{
				this.link();
				this.scroll();
			}
		},
		payment:
		{
			element: $('.js_tip').type('hover'),
			over: function()
			{
				var thatElement = this.element,
					button = thatElement.type('button', 'c');

				button.click(function(e)
				{
					e.stopImmediatePropagation();
				});

				thatElement
				.mouseover(function()
				{
					var self = $(this),
						selfData = self.data(),
						selfOffset = self.offset(),
						button = self.type('button', 'c'),
						buttonW = button.outerWidth(),
						buttonH = button.outerHeight(),
						tip = self.type('tip', 'c'),
						tipW = tip.outerWidth(),
						tipH = tip.outerHeight();

					tip.removeAttr('style');

					if(selfData.pos == 'top' || selfData.pos == 'bottom')
					{
						var pos = ['top', 'bottom'];

						tip.css('marginLeft', -tipW/2);

						if(selfOffset.top - $(window).scrollTop() + buttonH + tipH > $(window).height())
						{
							tip.css('bottom', buttonH);
						}
						else
						{
							pos.reverse();
						}

						tip.attr('class', function(index, attr)
						{
							return attr.replace(pos[0], pos[1]);
						});
					}

					thatElement.css('zIndex', 1);
					self.removeAttr('style');
				});
			},
			state: function()
			{
				this.over();
			}
		}
	},
	init: function()
	{
		this.general.state();
		this.tip.box.state();
		this.tip.payment.state();
	}
};

var Payment =
{
	time: 1000,
	gold:
	{
		element: $('.js_payment').type('gold'),
		block: function()
		{
			var that = this,
				system = Payment.system,
				block = this.element.type('block', 'c'),
				blockCustom = block.type('custom'),
				customForm = blockCustom.type('form', 'c'),
				customField = customForm.type('price', 'c'),
				fieldGold = customField.type('gold'),
				fieldReal = customField.type('real'),
				min = blockCustom.data('min'),
				max = blockCustom.data('max'),
				time = 0;

			block.
			click(function()
			{
				var self = $(this);

				if(this == blockCustom.get(0))
				{
					if(!customForm.is(':visible'))
					{
						setTimeout(function()
						{
							fieldGold.focus();
						},
							100
						);

						customField.val(null);
						time = 0;

						system.disable('bind');

						if(typeof(system.active) != 'undefined')
						{
							system.active.trigger('click');
							delete system.active;
						}
					}
				}
				else
				{
					that.amount = self.data('amount');

					Payment.system.disable('unbind');
					choicePayment(block);
				}

				block
				.addClass('hidden')
				.removeClass('checked');

				self
				.addClass('checked')
				.removeClass('hidden');
			});

			customField
			.keyup(function(e)
			{
				var that = this,
					self = $(this),
					key = e.keyCode;

				time = +new Date;

				if(key == 37 || key == 39)
				{
					e.stopImmediatePropagation();
					return false;
				}

				self
				.val(function(index, value)
				{
					if(self.data('separator'))
					{
						value = value.replace(/[^0-9\.,]/g, '');
					}
					else
					{
						value = value.replace(/\D/g, '');
					}

					that.val = parseFloat(value.replace(/[,]+/g, '.'));

					return value;
				});

				this.amount = self.data('exchange') * this.val;

				if(isNaN(this.val))
				{
					e.stopImmediatePropagation();

					validateAmount(min);
					customField.val(null);
					time = 0;

					system.disable('bind');
				}
			})
			.bind('hide', function()
			{
				var amount = +fieldGold.val();

				if(validateAmount(amount))
				{
					that.amount = amount;

					system.disable('unbind');
					choicePayment(block);
				}
			});

			fieldGold
			.keyup(function()
			{
				if(fieldReal.data('separator'))
				{
					var amount = this.amount.toFixed(2).replace('.00', '');
				}
				else
				{
					var amount = Math.ceil(this.amount);
				}

				validateAmount(this.val);
				fieldReal.val(amount);
			});

			fieldReal
			.keyup(function()
			{
				var amount = Math.floor(this.amount);

				validateAmount(amount);
				fieldGold.val(amount);
			});

			function validateAmount(amount)
			{
				fieldReal.removeClass('error');

				if(amount > min || amount < max || typeof(amount) == 'undefined')
				{
					fieldReal.addClass('error');
					system.disable('bind');

					return false;
				}
				else
				{
					return true;
				}
			}

			setInterval(function()
			{
				if(time)
				{
					system.disable('bind');

					var delay = +new Date - time;

					if(delay >= Payment.time)
					{
						time = 0;
						fieldGold.trigger('hide');
					}
				}
			}, 66);
		},
		state: function()
		{
			this.block();
		}
	},
	system:
	{
		element: $('.js_payment').type('system'),
		disable: function(state)
		{
			var self = this.element;
			var selfOver = '<div class="pt_tab__over" data-type="over"></div>';

			if(state == 'bind')
			{
				self
				.addClass('disabled')
				.prepend(selfOver);
			}

			if(state == 'unbind')
			{
				self
				.removeClass('disabled')
				.type('over', 'c')
				.remove();
			}
		},
		amount: function(state)
		{
			var tab = this.element.type('tab', 'c'),
				tabV = tab.filter(':visible'),
				block = tabV.type('block', 'b');

			if(state == 'set')
			{
				var form = tabV.type('form', 'c');

				form
				.type('amount', 'c')
				.remove();

				var formAmount = '<input type="hidden" name="amount" value="{gold}" data-type="amount">',
					exchange = block.data('exchange'),
					gold = Payment.gold.amount;

				form.prepend(formAmount.replace('{gold}', gold));

				if(typeof(exchange) != 'undefined')
				{
					var formGold = form.type('gold', 'c'),
						formReal = form.type('real', 'c'),
						real = Math.ceil(gold*block.data('exchange'));

					formGold.text(gold);
					formReal.text(real);
				}
			}

			if(state == 'paymentwall')
			{
				genPaymentWall(block);
			}
		},
		block: function()
		{
			var that = this,
				block = this.element.type('block', 'c'),
				tab = block.type('tab', 'a');

			block.each(function()
			{
				var self = $(this),
					selfI = self.index(),
					button = self.type('button', 'c');


				if(!button.hasClass('disabled'))
				{
					var tabLine = 6*2,
						tabMargin = 150,
						tabW = tab.first().width();

					self.on('click', button, function()
					{
						var	buttonS = $(window).scrollTop() + Math.abs(button.offset().top - $(window).scrollTop()),
							tabN = self.type('tab', 'a'),
							tabV = tab.filter(':visible'),
							buttonV = tabV.type('block', 'b').type('button', 'c');

						that.active = self;

						if(!button.hasClass('active'))
						{
							var tabIndex = (selfI%tabLine)/2 + 1,
								tabMarginAll = tabMargin*tabIndex;

							tabN
							.css(
							{
								display: 'inline-block',
								marginLeft: -tabW - tabMarginAll,
								marginRight: tabMarginAll
							});

							button.addClass('active');

							$('html, body')
							.stop(true, true)
							.animate(
							{
								scrollTop: buttonS
							},
								300
							);
						}

						if(tabV.length)
						{
							tabV.hide();
							buttonV.removeClass('active');
						}

						choicePayment(block);
					});
				}
			});
		},
		state: function()
		{
			this.disable('bind');
			this.block();
		}
	},
	load: function(data)
	{
		var gold = Payment.gold.element.type('block', 'c'),
			goldAmount = '[data-amount=' + data.amount + ']',
			system = Payment.system.element.type('block', 'c'),
			systemId = '[data-id=' + data.id + ']';

		if(data.custom)
		{
			var goldCustom = gold.type('custom'),
				goldForm = goldCustom.type('gold', 'c');

			goldCustom.trigger('click');
			goldForm.val(data.amount).trigger('keyup');
		}
		else
		{
			gold.filter(goldAmount).trigger('click');
		}

		system.filter(systemId).trigger('click');
	},
	action:
	{
		element: $('.js_time').type('time'),
		time: function()
		{
			var self = this.element;

			if(!self.length)
			{
				return false;
			}

			var time = self.data('time').split(':'),
				block = self.type('block', 'c');

			for(var i = 0; i < block.length; i++)
			{
				var blockI = block.eq(i),
					digit = blockI.type('digit', 'c'),
					digitClone = digit.clone().hide();

				digit.text(time[i]);
				blockI.append(digitClone);
			}

			this.counter($.map(time, Number), block);
		},
		counter: function(time, block)
		{
			var that = this,
				delay = 1000,
				next = tCycle(3, 60);

			if(next)
			{
				next = tCycle(2, 60);

				if(next)
				{
					next = tCycle(1, 24);

					if(next)
					{
						tCycle(0);
					}
				}
			}

			setTimeout(function()
			{
				that.counter(time, block);
			},
				delay
			);

			function tCycle(index, max)
			{
				var next = 0;

				if(time[index] == 0)
				{
					if(time[0] + time[1] + time[2])
					{
						next = 1;
						time[index] = max - 1;
					}
					else
					{
						return false;
					}
				}
				else
				{
					time[index] -= 1;
				}

				if(time[index] < 10)
				{
					var timeValue = 0 + time[index].toString();
				}
				else
				{
					var timeValue = time[index];
				}

				var digitBlock = block.eq(index).type('digit', 'c'),
					digitPrev =  digitBlock.slice(0, 2),
					digitNext = digitBlock.slice(-2).text(timeValue);

				digitNext
				.first()
				.slideDown(delay/2 - 100, function()
				{
					digitNext
					.last()
					.slideDown(delay/2 - 100, function()
					{
						digitNext.hide();
						digitPrev.text(timeValue);
					});
				});

				return next;
			}
		},
		state: function()
		{
			this.time();
		}
	},
	form:
	{
		digit:
		{
			element: $('.js_form').type('digit'),
			regexp: function()
			{
				var input = this.element.type('input', 'c');

				input
				.keyup(function()
				{
					$(this).val(function(index, value)
					{
						return value.replace(/\D/g, '');
					});
				});
			},
			state: function()
			{
				this.regexp();
			}
		},
		max:
		{
			element: $('.js_form').type('max'),
			cond: function()
			{
				var input = this.element.type('input', 'c');

				input
				.removeClass('valid error')
				.keyup(function()
				{
					var self = $(this),
						str = self.vlen();

					if(str)
					{
						if(str.length == input.attr('maxlength'))
						{
							self.addClass('valid');
						}
						else
						{
							self.addClass('error');
						}
					}
				});
			},
			state: function()
			{
				this.cond();
			}
		},
		trigger:
		{
			element: $('.js_form').type('trigger'),
			tab: function()
			{
				this.element
				.each(function()
				{
					var self = $(this),
						block = self.type('block', 'c'),
						button = self.type('button', 'c'),
						form = self.type('form', 'a+');

					button
					.click(function(e)
					{
						e.stopPropagation();

						var self = $(this),
							blockS = self.type('block', 'p'),
							index = blockS.index();

						form.hide();
						block.removeClass('checked');

						blockS.addClass('checked');
						form.eq(index).show();
					})
					.first()
					.trigger('click');
				});
			},
			state: function()
			{
				this.tab();
			}
		},
		state: function()
		{
			this.digit.state();
			this.max.state();
			this.trigger.state();
		}
	},
	init: function(data)
	{
		this.gold.state();
		this.system.state();
		this.action.state();
		this.form.state();

		if(typeof(data) != 'undefined')
		{
			this.load(data);
		}
	}
};

var Form =
{
	checkbox:
	{
		element: $('.js_form').type('checkbox'),
		label: function()
		{
			this.element
			.each(function()
			{
				var self = $(this),
					input = self.type('input', 'c');

				input
				.change(function()
				{
					input
					.prop('checked', function(i, value)
					{
						if(value)
						{
							self.addClass('checked');
						}
						else
						{
							self.removeClass('checked');
						}
					});
				})
				.trigger('change');
			})
			.mousedown(function()
			{
				return false;
			});
		},
		state: function()
		{
			this.label();
		}
	},
	radio:
	{
		element: $('.js_form').type('radiogroup'),
		label: function()
		{
			this.element
			.each(function()
			{
				var radio = $(this).type('radio', 'c');

				radio
				.each(function()
				{
					var self = $(this),
						input = self.type('input', 'c');

					input
					.change(function()
					{
						input
						.prop('checked', function(i, value)
						{
							if(value)
							{
								radio.removeClass('checked');
								self.addClass('checked');
							}
						});
					})
					.trigger('change');
				})
				.mousedown(function()
				{
					return false;
				});
			});
		},
		state: function()
		{
			this.label();
		}
	},
	placeholder:
	{
		element: $('.js_form').type('placeholder'),
		general: function()
		{
			var label = this.element.type('general');

			label
			.each(function()
			{
				var self = $(this),
					input = self.type('input', 'c');

				input
				.keyup(function()
				{
					if(input.vlen())
					{
						self.addClass('content');
					}
					else
					{
						self.removeClass('content');
					}
				});
			});
		},
		tel: function()
		{
			var label = this.element.type('tel');

			function cursorPos(obj, type, pos)
			{
				if (document.selection)
				{
					var range = document.selection.createRange();

					range.moveStart('textedit', -1);

					if(type == 'get')
					{
						return range.text.length;
					}

					if(type == 'set')
					{
						range.collapse(true);
						range.moveEnd('character', pos);
						range.moveStart('character', pos);
						range.select();
					}
				}
				else
				{
					if(type == 'get')
					{
						return obj.get(0).selectionStart;
					}

					if(type == 'set')
					{
						if(typeof(pos) != 'undefined')
						{
							obj.get(0).setSelectionRange(pos, pos);
						}
					}
				}
			}

			label
			.each(function()
			{
				var self = $(this),
					input = self.type('input', 'c'),
					label = self.type('label', 'c'),
					hidden = '<input type="hidden" name="' + input.data('name') + '" value="{value}" data-type="hidden">',
					mask = label.text();

				input
				.keyup(function(e)
				{
					var str = '',
						key = e.keyCode,
						cursor = 0;

					if(key == 37 || key == 39)
					{
						e.stopImmediatePropagation();
						return false;
					}

					input
					.val(function(index, value)
					{
						var val = value.replace(/\D/g, '');

						input.type('hidden', 'a').remove();
						input.after(hidden.replace('{value}', val));

						for(var i = 0; i < mask.length; i++)
						{
							if(mask[i] == '_')
							{
								if(val)
								{
									str += val[0];
									val = val.substr(1);
								}
								else
								{
									break;
								}
							}
							else
							{
								str += mask[i];
							}
						}

						str = str.replace(/[\(\) \-\+]+$/, '');
						label.html('<span>' + str + '</span>' + mask.slice(str.length, mask.length));

						if(key == 8)
						{
							cursor = cursorPos(input, 'get');

							while((isNaN(+str[cursor - 1]) || !+str[cursor - 1]) && cursor)
							{
								cursor--;
							}
						}

						return str;
					});

					if(cursor)
					{
						cursorPos(input, 'set', cursor);
						cursor = 0;
					}

					self.removeClass('error valid');

					if(str)
					{
						input.removeClass('shift');

						if(str.length == input.attr('maxlength'))
						{
							self.addClass('valid');
						}
						else
						{
							self.addClass('error');
						}
					}
					else
					{
						input.addClass('shift');
					}
				})
				.trigger('keyup');
			});
		},
		state: function()
		{
			this.general();
			this.tel();
		}
	},
	select:
	{
		element: $('.js_form').type('select'),
		replace: function()
		{
			var select = [];

			this.element
			.each(function()
			{
				var self = $(this),
					option = self.find('option'),
					optionI = option.filter(':selected').index() || 0,
					list = '';

				list += '<div class="' + self.attr('class') + '" data-type="' + self.data('type') + '" data-name="' + self.data('name') + '" data-index="' + optionI + '">';
				list += '<p data-type="checked"></p><div data-type="block">';

				option
				.each(function()
				{
					var self = $(this);

					list += '<div data-type="item" data-value="' + self.attr('value') + '">' + self.text() + '</div>';
				});

				list += '</div></div>';

				select.push($(list).replaceAll(self).get(0));
			});

			return $(select);
		},
		list: function()
		{
			var select = this.replace(),
				selectC = select.type('checked', 'c');

			select
			.each(function()
			{
				var list = $(this),
					listC = list.type('checked', 'c'),
					listB = list.type('block', 'c'),
					listI = listB.type('item', 'c'),
					hidden = '<input type="hidden" name="' + list.data('name') + '" value="{value}" data-type="hidden">';

				listC
				.click(function(e, state)
				{
					e.stopPropagation();

					if(list.hasClass('checked'))
					{
						list.removeClass('checked');
					}
					else
					{
						if(typeof(state) == 'undefined')
						{
							select.removeClass('checked');
							list.addClass('checked');
						}
					}
				})
				.mousedown(function()
				{
					return false;
				});

				listI
				.click(function()
				{
					var self = $(this);

					listI.removeClass('checked');
					listC.trigger('click', 'hide').text(self.text());
					self.addClass('checked');

					list.type('hidden', 'c').remove();
					list.append(hidden.replace('{value}', self.data('value')));
				})
				.eq(list.data('index'))
				.trigger('click');

				listB
				.jScrollPane(
				{
					showArrows: true,
					verticalGutter: 25,
					verticalDragMinHeight: 30,
					mouseWheelSpeed: 60,
					autoReinitialise: true
				});
			});

			$('body')
			.click(function()
			{
				selectC.trigger('click', 'hide');
			});
		},
		state: function()
		{
			this.list();
		}
	},
	init: function()
	{
		this.checkbox.state();
		this.radio.state();
		this.placeholder.state();
		this.select.state();
	}
};

var Slider =
{
	general:
	{
		element: $('.js_slider').type('slider'),
		slider: function(self)
		{
			this['s'] = self.type('slide', 'c');
			this['n'] = self.type('nav', 'c');
			this['np'] = this['n'].type('pos');
			this['nl'] = this['np'].type('left');
			this['nr'] = this['np'].type('right');
			this['nb'] = this['n'].type('button');
		},
		nav: function()
		{
			var that = this;

			this.element
			.each(function()
			{
				var self = $(this),
					slider = new that.slider(self),
					name = self.data('name'),
					index = 0;

				slider['n'].mousedown(function(){return false;});

				slider['nr']
				.click(function()
				{
					that.slide(slider, ++index);
				});

				slider['nl']
				.click(function()
				{
					that.slide(slider, --index);
				});

				slider['nb']
				.click(function()
				{
					index = $(this).index();

					that.slide(slider, index);
				});

				if(typeof(name) != 'undefined')
				{
					var tab = self.type('tab', 'p');
					slider['no'] = tab.type(name, 'c');

					slider['no']
					.click(function()
					{
						index = $(this).index();

						that.slide(slider, index);
					})
				}

				that.slide(slider, index);
			});
		},
		slide: function(slider, index)
		{
			slider['np'].css('visibility', 'hidden');
			slider['nb'].removeClass('checked');
			slider['s'].removeClass('checked');

			if(index == 0)
			{
				slider['nr'].css('visibility', 'visible');
			}
			else if(index == slider['s'].length - 1)
			{
				slider['nl'].css('visibility', 'visible');
			}
			else
			{
				slider['np'].css('visibility', 'visible');
			}

			slider['nb'].eq(index).addClass('checked');
			slider['s'].eq(index).addClass('checked');

			if(typeof(slider['no']) != 'undefined')
			{
				slider['no']
				.removeClass('checked')
				.each(function()
				{
					var self = $(this);

					if(self.index() <= index)
					{
						self.addClass('checked');
					}
				});
			}
		},
		state: function()
		{
			this.nav();
		}
	},
	init: function()
	{
		this.general.state();
	}
};
