"""
CodeForge plot hook — monkey-patches matplotlib.pyplot.show() so that
plt.show() saves the current figure as a base64 PNG and prints it
with special markers the frontend can detect and render inline.

Marker format:
  __CODEFORGE_IMG__<base64 data>__END_CODEFORGE_IMG__
"""
import atexit, sys, os

# Force the non-interactive Agg backend before anything imports matplotlib
os.environ['MPLBACKEND'] = 'Agg'

def _install_hook():
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as _plt
        import base64, io

        _original_show = _plt.show

        def _codeforge_show(*args, **kwargs):
            """Intercept plt.show(): render every open figure to base64 PNG."""
            figs = [_plt.figure(n) for n in _plt.get_fignums()]
            for fig in figs:
                buf = io.BytesIO()
                fig.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                            facecolor=fig.get_facecolor(), edgecolor='none')
                buf.seek(0)
                encoded = base64.b64encode(buf.read()).decode('utf-8')
                buf.close()
                # Print with markers so the frontend can detect and render
                sys.stdout.write(f'__CODEFORGE_IMG__{encoded}__END_CODEFORGE_IMG__\n')
                sys.stdout.flush()
            _plt.close('all')

        _plt.show = _codeforge_show
    except ImportError:
        pass  # matplotlib not used in this script — nothing to patch

# Install the hook at import time
_install_hook()
