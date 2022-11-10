export interface ValorantConfigResponse {
    LastApplication: string
    Collapsed: {
        'ARES_MOC_ENTITLEMENT': string
        'CLIENT.ICONS.ENABLED': 'true' | 'false'
        'CLIENT_LEADERBOARDS_ENABLED': 'true' | 'false'
        'GAME_ALLOW_CONSOLE': 'true' | 'false'
        'GAME_ALLOW_DEVELOPER_MENU': 'true' | 'false'
        'GAME_DISABLED_DEATHCAM': 'true' | 'false'
        'GAME_DISABLED_SKINS_WEAPONS': string
        'GAME_PERFREPORTING_ENABLED': 'true' | 'false'
        'GAME_REMOTE_MOVE_INTERP_ENABLED': 'true' | 'false'
        'GAME_ROAMINGSETTINGS_ENABLED': 'true' | 'false'
        'GAME_ROAMINGSETTINGS_KEY': string
        'GAME_ROAMINGSETTINGS_STORAGEURL': string
        'MAP_PRELOADING_ENABLED': 'true' | 'false'
        'NAMECHECK_PLATFORM_REGION': string
        'NAMECHECK_PLATFORM_URL': string
        'SECURITY_WATERMARK_ENABLED': 'true' | 'false'
        'SECURITY_WATERMARK_MAX_OPACITY': string
        'SECURITY_WATERMARK_MIN_OPACITY': string
        'SECURITY_WATERMARK_TILING_FACTOR': string
        'SERVICEURL_ACCOUNT_XP': string
        'SERVICEURL_AGGSTATS': string
        'SERVICEURL_CONTENT': string
        'SERVICEURL_CONTRACTS': string
        'SERVICEURL_CONTRACT_DEFINITIONS': string
        'SERVICEURL_COREGAME': string
        'SERVICEURL_DAILY_TICKET': string
        'SERVICEURL_FAVORITES': string
        'SERVICEURL_LATENCY': string
        'SERVICEURL_LOGINQUEUE': string
        'SERVICEURL_MASS_REWARDS': string
        'SERVICEURL_MATCHDETAILS': string
        'SERVICEURL_MATCHHISTORY': string
        'SERVICEURL_MATCHMAKING': string
        'SERVICEURL_MMR': string
        'SERVICEURL_NAME': string
        'SERVICEURL_PARTY': string
        'SERVICEURL_PATCHNOTES': string
        'SERVICEURL_PERSONALIZATION': string
        'SERVICEURL_PLAYERFEEDBACK': string
        'SERVICEURL_PREGAME': string
        'SERVICEURL_PREMIER': string
        'SERVICEURL_PROGRESSION': string
        'SERVICEURL_PURCHASEMERCHANT': string
        'SERVICEURL_RESTRICTIONS': string
        'SERVICEURL_SESSION': string
        'SERVICEURL_STORE': string
        'SERVICE_TICKER_MESSAGE': string
        'SERVICE_TICKER_MESSAGE.de-DE': string
        'SERVICE_TICKER_MESSAGE.es-MX': string
        'SERVICE_TICKER_MESSAGE.fr-FR': string
        'SERVICE_TICKER_MESSAGE.it-IT': string
        'SERVICE_TICKER_MESSAGE.pl-PL': string
        'SERVICE_TICKER_MESSAGE.pt-BR': string
        'SERVICE_TICKER_MESSAGE.ru-RU': string
        'SERVICE_TICKER_MESSAGE.tr-TR': string
        'SERVICE_TICKER_SEVERITY': string
        'STORESCREEN_OFFERREFRESH_MAXDELAY_MILLISECONDS': string
        'cap.location': string
        'characterselect.debugwidgets.hide': 'true' | 'false'
        'chat.mutedwords.enabled': 'true' | 'false'
        'chat.v3.enabled': 'true' | 'false'
        'collection.characters.enabled': 'true' | 'false'
        'competitiveSeasonOffsetEndTime': string
        'config.client.telemetry.samplerate': string
        'content.filter.enabled': 'true' | 'false'
        'content.maps.disabled': string
        'eog.wip': 'true' | 'false'
        'favorites.favorites.enabled': 'true' | 'false'
        'friends.enabled': 'true' | 'false'
        'game.umgchat.enabled': 'true' | 'false'
        'homescreen.featuredQueues': string
        'homescreen.promo.enabled': 'true' | 'false'
        'homescreen.promo.key': string
        'loginqueue.region': string
        'mainmenubar.collections.enabled': 'true' | 'false'
        'mainmenubar.debug.enabled': 'true' | 'false'
        'mainmenubar.profile.enabled': 'true' | 'false'
        'mainmenubar.progression.enabled': 'true' | 'false'
        'mainmenubar.shootingrange.enabled': 'true' | 'false'
        'mainmenubar.store.enabled': 'true' | 'false'
        'match.details.delay': string
        'notifications.enabled': 'true' | 'false'
        'parties.auto.balance.enabled': 'true' | 'false'
        'party.observers.enabled': 'true' | 'false'
        'partyinvites.enabled': 'true' | 'false'
        'patchavailability.enabled': 'true' | 'false'
        'personalization.equipAnyLevel.enabled': 'true' | 'false'
        'personalization.useWidePlayerIdentityV2': 'true' | 'false'
        'ping.update.interval': string
        'ping.useGamePodsFromParties': 'true' | 'false'
        'platformFaulted.level': string
        'playerfeedbacktool.accessurl': string
        'playerfeedbacktool.locale': string
        'playerfeedbacktool.shard': string
        'playerfeedbacktool.show': 'true' | 'false'
        'playerfeedbacktool.survey_request_rate_float': string
        'playscreen.partywidget.enabled': 'true' | 'false'
        'playscreen.partywidget.matchmaking.maxsize': string
        'queue.status.enabled': 'true' | 'false'
        'rchat.ingame.enabled': 'true' | 'false'
        'reporterfeedback.fetch.enabled': 'true' | 'false'
        'reporterfeedback.notifications.enabled': 'true' | 'false'
        'restrictions.v2.fetch.enabled': 'true' | 'false'
        'restrictions.v2.warnings.enabled': 'true' | 'false'
        'riotwarning.fetch.enabled': 'true' | 'false'
        'riotwarning.notifications.enabled': 'true' | 'false'
        'rnet.useAuthenticatedVoice': 'true' | 'false'
        'russia.voice.enabled': 'true' | 'false'
        'settings.livediagnostics.allowedplayers': string
        'shootingtest.enabled': 'true' | 'false'
        'skillrating.enabled': 'true' | 'false'
        'skillrating.inGame.enabled': 'true' | 'false'
        'skillrating.preGame.enabled': 'true' | 'false'
        'social.panel.v6.enabled': 'true' | 'false'
        'socialviewcontroller.enabled': 'true' | 'false'
        'socialviewcontroller.v2.enabled': 'true' | 'false'
        'store.use_currency_inventory_models': 'true' | 'false'
        'store.use_platform_bundle_discounted_prices': 'true' | 'false'
        'temp.voice.allowmuting': 'true' | 'false'
        'vanguard.accessurl': string
        'vanguard.netrequired': 'true' | 'false'
        'voice.clutchmute.enabled': 'true' | 'false'
        'voice.clutchmute.prompt.enabled': 'true' | 'false'
        'voice.provider': string
        'whisper.enabled': 'true' | 'false'
    }
}
