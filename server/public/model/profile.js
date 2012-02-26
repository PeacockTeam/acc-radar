var Profile = {

    modelProfile: {
        acceleration: {
            severity: {
                m: {
                   from: 0.35,
                   to: 0.4
                },
                h: {
                   from: 0.4,
                   to: 0.5
                },
                e: {
                   from: 0.5
                }
            },
            min_time_distance: 0.5,
            min_duration: 0.5,
        },

        braking: {
            severity: {
                m: {
                   from: 0.4,
                   to: 0.6
                },
                h: {
                   from: 0.6,
                   to: 0.7
                },
                e: {
                   from: 0.7,
                }
            },
            min_time_distance: 0.5,
            min_duration: 0.5,
        },

        cornering: {
            severity: {
                m: {
                   from: 0.45,
                   to: 0.6
                },
                h: {
                   from: 0.6,
                   to: 0.75
                },
                e: {
                   from: 0.75
                }
            },
            min_time_distance: 0.5,
            min_duration: 0.5,
        },

        speed: {
            severity: {
                m: {
                   from: 60,
                   to: 90
                },
                h: {
                   from: 90,
                   to: 120
                },
                e: {
                   from: 120 
                }
            },
            min_time_distance: 0.5,
            min_duration: 0.5,
        }
    },

    scoreProfile: {
        acceleration: {
            m: 0.1,
            h: 0.2,
            e: 0.7 
        },
        braking: {
            m: 0.1, 
            h: 0.2, 
            e: 0.7 
        },
        cornering: {
            m: 0.1, 
            h: 0.2, 
            e: 0.7 
        },
        speed: {
            m: 0.1,
            h: 0.2,
            e: 0.7
        },
        summary: {
            acceleration: 1,
            braking: 1,
            cornering: 1,
            speed: 1
        }
    }

};
