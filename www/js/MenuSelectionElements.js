class MenuSelectionElements {
    constructor() {
        this.menuSelectionGameSingle = { element: this.qS(".menu_selection_game_single"), display: "gamesettings", type: "singlemode", target: "menu_selection_game-container" };
        this.menuSelectionGameMulti = { element: this.qS(".menu_selection_game_multi"), display: "multi" };
        this.menuSelectionGameProfile = { element: this.qS(".menu_selection_game_profile"), display: "profile" };
        this.menuSelectionGameOptions = { element: this.qS(".menu_selection_game_options"), display: "options" };
        this.menuSelectionGameProfileNew = { element: this.qS(".menu_selection_game_profile_new"), display: "editprofile", type: "new", target: "menu_selection_game_edit_profile-container" };
        this.menuSelectionGameProfileLoad = { element: this.qS(".menu_selection_game_profile_load"), display: "profiles", item: "" };
        this.menuSelectionGameProfileShowProfileEdit = { element: this.qS(".menu_selection_game_show_profile_edit"), display: "editprofile", type: "edit", target: "menu_selection_game_edit_profile-container" };
        this.menuSelectionGameProfileShowProfileDelete = { element: this.qS(".menu_selection_game_show_profile_delete"), display: "profile", item: "deleteprofile" };
        this.menuSelectionGameProfileShow = { element: this.qS(".menu_selection_game_profile_show"), display: "showprofile", item: "show" };
        this.menuSelectionGameId = { element: this.qS(".menu_selection_game_id"), display: "gamesettings", item: "roomid" };
        this.menuSelectionGameType = { element: this.qS(".menu_selection_game_type"), display: "gamesettings", item: "roomtype" };
        this.menuSelectionGameNumberOfPlayers = { element: this.qS(".menu_selection_game_number_of_players"), display: "gamesettings", item: "nbofplayers" };
        this.menuSelectionGameBuyIn = { element: this.qS(".menu_selection_game_buy_in"), display: "gamesettings", item: "buyin" };
        this.menuSelectionGameBackground = { element: this.qS(".menu_selection_game_background"), display: "gamesettings", item: "background" };
        this.menuSelectionGameStart = { element: this.qS(".menu_selection_game_start"), display: "gamesettings", type: "start" };
        this.menuSelectionGameCreate = { element: this.qS(".menu_selection_game_create"), display: "gamemultiroom", type: "create" };
        this.menuSelectionGameBack = { element: this.qS(".menu_selection_game_back"), display: "", item: "" };
        this.menuSelectionGameMultiCreateRoom = { element: this.qS(".menu_selection_game_multi_create_room"), display: "gamesettings", type: "createroom", target: "menu_selection_game-container" };
        this.menuSelectionGameMultiJoinRoom = { element: this.qS(".menu_selection_game_multi_join_room"), display: "joinroom", item: "" };
        this.menuSelectionGameMultiBack = { element: this.qS(".menu_selection_game_multi_back"), display: "", item: "" };
        this.menuSelectionGameMultiJoinRoomPublic = { element: this.qS(".menu_selection_game_multi_join_room_public"), display: "joinroomrooms", type: "joinpublic", target: "menu_selection_game_multi_join_room_rooms-container" };
        this.menuSelectionGameMultiJoinRoomPrivate = { element: this.qS(".menu_selection_game_multi_join_room_private"), display: "joinroomrooms", type: "joinprivate", target: "menu_selection_game_multi_join_room_rooms-container" };
        this.menuSelectionGameMultiJoinRoomStart = { element: this.qS(".menu_selection_game_multi_room_start"), display: "gamemultiroom", type: "start" };
        this.menuSelectionGameMultiJoinRoomBack = { element: this.qS(".menu_selection_game_multi_join_room_back"), display: "multi", item: "" };
        this.menuSelectionGameMultiJoinRoomRoomsBack = { element: this.qS(".menu_selection_game_multi_join_room_rooms_back"), display: "joinroom", item: "" };
        this.menuSelectionGameMultiRoomBack = { element: this.qS(".menu_selection_game_multi_room_back"), display: "", item: "" };
        this.menuSelectionGameProfileProfile1 = { element: this.qS(`[data-pflnb="1"]`), item: "profileaction" };
        this.menuSelectionGameProfileProfile2 = { element: this.qS(`[data-pflnb="2"]`), item: "profileaction" };
        this.menuSelectionGameProfileProfile3 = { element: this.qS(`[data-pflnb="3"]`), item: "profileaction" };
        this.menuSelectionGameProfileProfile4 = { element: this.qS(`[data-pflnb="4"]`), item: "profileaction" };
        this.menuSelectionGameProfileProfile5 = { element: this.qS(`[data-pflnb="5"]`), item: "profileaction" };
        this.menuSelectionGameProfileBack = { element: this.qS(".menu_selection_game_profile_back"), display: "", item: "" };
        this.menuSelectionGameProfilesBack = { element: this.qS(".menu_selection_game_profiles_back"), display: "profile", item: "" };
        this.menuSelectionGameProfileShowBack = { element: this.qS(".menu_selection_game_show_profile_back"), display: "profile", item: "" };
        this.menuSelectionGameProfileEditLoad = { element: this.qS(".menu_selection_game_edit_profile_load"), display: "profile", item: "loadprofile" };
        this.menuSelectionGameProfileEditEdit = { element: this.qS(".menu_selection_game_edit_profile_edit"), display: "profile", item: "editprofile" };
        this.menuSelectionGameProfileEditSave = { element: this.qS(".menu_selection_game_edit_profile_save"), display: "profile", item: "saveprofile" };
        this.menuSelectionGameProfileEditName = { element: this.qS(".menu_selection_game_edit_profile_name"), item: "name" };
        this.menuSelectionGameProfileEditAvatar = { element: this.qS(".menu_selection_game_edit_profile_avatar"), item: "avatar" };
        this.menuSelectionGameProfileEditBack = { element: this.qS(".menu_selection_game_edit_profile_back"), display: "profile", item: "" };
        this.menuSelectionGameOptionsSound = { element: this.qS(".menu_selection_game_options_sound"), item: "sound" };
        this.menuSelectionGameOptionsFullscreen = { element: this.qS(".menu_selection_game_options_fullscreen"), item: "fullscreen" };
        this.menuSelectionGameOptionsColorOn = { element: this.qS(".menu_selection_game_options_coloron"), item: "coloron" };
        this.menuSelectionGameOptionsBack = { element: this.qS(".menu_selection_game_options_back"), display: "", item: "" };
    }

    qS(className) {
        return document.querySelector(className);
    }
}