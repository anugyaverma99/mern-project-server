const permissions={
    admin:[
        'user:create',
        'user:delete',
        'user:update',
        'user:read',
        'link:create',
        'link:delete',
        'link:read',
    ],
    developer:[
        'link : read'
    ],
    viewer:[
        'link:read',
        'user:read'
    ]
};
module.exports=permissions;