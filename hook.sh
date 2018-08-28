#!/bin/bash

USER_COMMAND=$0

# version for hook.sh
HOOK_VERSION="v0.9.0"

OPT_RUN=0
OPT_DISCARD=0
OPT_VERSION=0
OPT_HELP=0

OPT_UNKNOWN=""

while [ ! -z "$1" ]
do
    case $1 in
    -v|--version)
        OPT_VERSION=1;;
    -run)
        OPT_RUN=1;;
    -discard)
        OPT_DISCARD=1;;
    -h|--help)
        OPT_HELP=1;;
    *)
        OPT_UNKNOWN="${OPT_UNKNOWN} $1";;
    esac
    shift
done

if [ ! -z "${OPT_UNKNOWN}" ]; then
    echo ""
    echo -e "Unknown options: \033[31m\033[1m${OPT_UNKNOWN}\033[0m"
    OPT_HELP=1
fi

if [ $OPT_HELP == 1 ]; then
    echo ""
    echo "usage: "`basename ${USER_COMMAND}`" [[-v | --version] hook.sh version]"
    echo -e "       \033[8m"`basename ${USER_COMMAND}`"\033[0m [[-run] hook react native js]"
    echo -e "       \033[8m"`basename ${USER_COMMAND}`"\033[0m [[-discard] discard hook]"
    echo "       -h, --help: this help"
    echo ""
    exit 1
fi

if [ $OPT_VERSION == 1 ]; then
    echo ""
    echo "hook.sh version $HOOK_VERSION"
    echo ""
    exit 1
fi

if [ $OPT_RUN == 1 ]; then

    exit 1
fi

if [ $OPT_DISCARD == 1 ]; then

    exit 1
fi

