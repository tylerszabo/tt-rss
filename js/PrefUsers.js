'use strict'
/* global __, ngettext */
define(["dojo/_base/declare"], function (declare) {

	return declare("fox.PrefUsers", null, {
		reload: function(sort) {
			const user_search = $("user_search");
			const search = user_search ? user_search.value : "";

			xhrPost("backend.php", { op: "pref-users", sort: sort, search: search }, (transport) => {
				dijit.byId('userConfigTab').attr('content', transport.responseText);
				notify("");
			});
		},
		add: function() {
			const login = prompt(__("Please enter username:"), "");

			if (login) {
				notify_progress("Adding user...");

				xhrPost("backend.php", {op: "pref-users", method: "add", login: login}, (transport) => {
					alert(transport.responseText);
					Users.reload();
				});

			}
		},
		edit: function(id) {
			const query = "backend.php?op=pref-users&method=edit&id=" +
				param_escape(id);

			if (dijit.byId("userEditDlg"))
				dijit.byId("userEditDlg").destroyRecursive();

			const dialog = new dijit.Dialog({
				id: "userEditDlg",
				title: __("User Editor"),
				style: "width: 600px",
				execute: function () {
					if (this.validate()) {
						notify_progress("Saving data...", true);

						xhrPost("backend.php", dojo.formToObject("user_edit_form"), (transport) => {
							dialog.hide();
							Users.reload();
						});
					}
				},
				href: query
			});

			dialog.show();
		},
		resetSelected: function() {
			const rows = this.getSelection();

			if (rows.length == 0) {
				alert(__("No users selected."));
				return;
			}

			if (rows.length > 1) {
				alert(__("Please select one user."));
				return;
			}

			if (confirm(__("Reset password of selected user?"))) {
				notify_progress("Resetting password for selected user...");

				const id = rows[0];

				xhrPost("backend.php", {op: "pref-users", method: "resetPass", id: id}, (transport) => {
					notify('');
					alert(transport.responseText);
				});

			}
		},
		removeSelected: function() {
			const sel_rows = this.getSelection();

			if (sel_rows.length > 0) {
				if (confirm(__("Remove selected users? Neither default admin nor your account will be removed."))) {
					notify_progress("Removing selected users...");

					const query = {
						op: "pref-users", method: "remove",
						ids: sel_rows.toString()
					};

					xhrPost("backend.php", query, () => {
						this.reload();
					});
				}

			} else {
				alert(__("No users selected."));
			}
		},
		editSelected: function() {
			const rows = this.getSelection();

			if (rows.length == 0) {
				alert(__("No users selected."));
				return;
			}

			if (rows.length > 1) {
				alert(__("Please select one user."));
				return;
			}

			this.edit(rows[0]);
		},
		getSelection :function() {
			return Tables.getSelected("prefUserList");
		}
	});
});


