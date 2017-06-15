# -*- coding: utf-8 -*-

import sys, os

from recommonmark.parser import CommonMarkParser

source_parsers = {
    '.md': CommonMarkParser,
}



sys.path.insert(0, os.path.abspath('extensions'))

extensions = ['sphinx.ext.autodoc', 'sphinx.ext.doctest', 'sphinx.ext.todo',
              'sphinx.ext.coverage', 'sphinx.ext.pngmath', 'sphinx.ext.ifconfig']

todo_include_todos = True
templates_path = ['_templates']
source_suffix = ['.md']
master_doc = 'index'
exclude_patterns = []
add_function_parentheses = True
#add_module_names = True
# A list of ignored prefixes for module index sorting.
#modindex_common_prefix = []

project = u'DekuBot'
copyright = u'2017, RoddersGH'

version = ''
release = ''


################################################################################


def setup(app):
     from sphinx.util.texescape import tex_replacements
     tex_replacements += [(u'♮', u'$\\natural$'),
                          (u'ē', u'\=e'),
                          (u'♩', u'\quarternote'),
                          (u'↑', u'$\\uparrow$'),
                          ]
